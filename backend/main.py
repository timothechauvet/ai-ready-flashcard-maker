"""
YASSSF Backend API — lightweight FastAPI service for flashcard deck management.

Features:
- Serves hardcoded German + legacy decks from bundled YAML files
- Accepts YAML uploads (max 2 MB, 1 import/minute global cooldown)
- Stores uploaded decks in SQLite
- Returns deck collections, subgroups, and individual decks
"""

import os
import re
import time
import uuid
import sqlite3
import json
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

import yaml
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MAX_UPLOAD_BYTES = 2 * 1024 * 1024  # 2 MB
COOLDOWN_SECONDS = 60
DB_PATH = os.environ.get("YASSSF_DB_PATH", "/data/yasssf.db")
BUNDLED_DECKS_DIR = Path(__file__).parent / "decks"

# ---------------------------------------------------------------------------
# Global rate-limit state (single-process; good enough for this scale)
# ---------------------------------------------------------------------------
_last_import_ts: float = 0.0


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = _get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS decks (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            folder      TEXT,
            subfolder   TEXT,
            level       TEXT,
            category    TEXT,
            part        INTEGER,
            cards_json  TEXT NOT NULL,
            source      TEXT NOT NULL DEFAULT 'upload',
            created_at  REAL NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS idx_decks_folder ON decks(folder);
        CREATE INDEX IF NOT EXISTS idx_decks_source ON decks(source);
    """)
    conn.close()


# ---------------------------------------------------------------------------
# Bundled deck loader
# ---------------------------------------------------------------------------
def _parse_yaml_file(path: Path) -> list[dict]:
    try:
        with open(path) as f:
            data = yaml.safe_load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _capitalize(s: str) -> str:
    return s[0].upper() + s[1:] if s else s


def _load_bundled_decks():
    """Load all bundled YAML deck files into the DB with source='bundled'."""
    conn = _get_db()

    # Clear previous bundled decks (refresh on every start)
    conn.execute("DELETE FROM decks WHERE source = 'bundled'")

    german_dir = BUNDLED_DECKS_DIR / "german"
    if german_dir.exists():
        for yaml_path in sorted(german_dir.rglob("*.yaml")):
            rel = yaml_path.relative_to(german_dir)
            parts = list(rel.parts)

            # Skip level-aggregate files like A1.1.yaml
            if len(parts) < 3:
                continue

            level_dir = parts[0]   # A1
            sublevel = parts[1]    # A1.1
            filename = parts[2]    # nouns_3.yaml or verbs.yaml

            match = re.match(r"^([a-z]+?)(?:_(\d+))?\.yaml$", filename)
            if not match:
                continue

            category = match.group(1)
            part_num = int(match.group(2)) if match.group(2) else None

            cards = _parse_yaml_file(yaml_path)
            if not cards:
                continue

            part_suffix = f"-pt{part_num}" if part_num else ""
            part_label = f" ({part_num})" if part_num else ""
            deck_id = f"german-{sublevel.replace('.', '-').lower()}-{category}{part_suffix}"

            conn.execute(
                """INSERT OR REPLACE INTO decks
                   (id, title, description, folder, subfolder, level, category, part, cards_json, source)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    deck_id,
                    f"German {sublevel} • {_capitalize(category)}{part_label}",
                    f"{len(cards)} cards • {_capitalize(category)} deck for {sublevel}{part_label}",
                    "German",
                    f"{level_dir}/{sublevel}",
                    sublevel,
                    category,
                    part_num,
                    json.dumps(cards),
                    "bundled",
                ),
            )

    # Legacy decks
    for legacy_file, deck_id, title, desc in [
        ("sample_deck.yaml", "german-idioms", "German Idioms & Nuances", "Advanced German vocabulary and expressions"),
        ("kannada_colors.yaml", "kannada-colors", "Kannada Colors", "Colors in Kannada script with pronunciation"),
    ]:
        path = BUNDLED_DECKS_DIR / legacy_file
        if path.exists():
            cards = _parse_yaml_file(path)
            conn.execute(
                """INSERT OR REPLACE INTO decks
                   (id, title, description, folder, subfolder, level, category, part, cards_json, source)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (deck_id, title, f"{len(cards)} cards • {desc}", None, None, None, None, None, json.dumps(cards), "bundled"),
            )

    conn.commit()
    total = conn.execute("SELECT count(*) FROM decks WHERE source='bundled'").fetchone()[0]
    conn.close()
    return total


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_db()
    n = _load_bundled_decks()
    print(f"Loaded {n} bundled decks into database")
    yield


app = FastAPI(
    title="YASSSF API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# GET /decks — list all decks (meta only, no cards)
# ---------------------------------------------------------------------------
@app.get("/decks")
async def list_decks(folder: Optional[str] = None, source: Optional[str] = None):
    conn = _get_db()
    query = "SELECT id, title, description, folder, subfolder, level, category, part, source FROM decks WHERE 1=1"
    params: list = []
    if folder:
        query += " AND folder = ?"
        params.append(folder)
    if source:
        query += " AND source = ?"
        params.append(source)
    query += " ORDER BY folder, subfolder, category, part"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# GET /decks/{deck_id} — single deck with cards
# ---------------------------------------------------------------------------
@app.get("/decks/{deck_id}")
async def get_deck(deck_id: str):
    conn = _get_db()
    row = conn.execute("SELECT * FROM decks WHERE id = ?", (deck_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Deck not found")
    d = dict(row)
    d["cards"] = json.loads(d.pop("cards_json"))
    return d


# ---------------------------------------------------------------------------
# GET /collections — grouped deck structure
# ---------------------------------------------------------------------------
@app.get("/collections")
async def list_collections():
    conn = _get_db()
    rows = conn.execute(
        """SELECT id, title, description, folder, subfolder, level, category, part, source,
                  json_array_length(cards_json) as card_count
           FROM decks ORDER BY folder, subfolder, category, part"""
    ).fetchall()
    conn.close()

    # Group by folder → subfolder → category
    collections: dict = {}
    for row in rows:
        r = dict(row)
        folder = r.get("folder") or "Other"
        subfolder = r.get("subfolder") or ""
        category = r.get("category") or "general"

        if folder not in collections:
            collections[folder] = {"folder": folder, "subfolders": {}}

        sf = collections[folder]["subfolders"]
        if subfolder not in sf:
            sf[subfolder] = {"subfolder": subfolder, "level": r.get("level", ""), "categories": {}}

        cats = sf[subfolder]["categories"]
        if category not in cats:
            cats[category] = {"category": category, "decks": []}

        cats[category]["decks"].append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "part": r.get("part"),
            "card_count": r["card_count"],
        })

    # Convert to lists
    result = []
    for folder_data in collections.values():
        folder_entry = {
            "folder": folder_data["folder"],
            "subfolders": [],
        }
        for sf_data in folder_data["subfolders"].values():
            sf_entry = {
                "subfolder": sf_data["subfolder"],
                "level": sf_data["level"],
                "categories": [
                    {"category": cat_data["category"], "decks": cat_data["decks"]}
                    for cat_data in sf_data["categories"].values()
                ],
            }
            sf_entry["total_cards"] = sum(
                d["card_count"] for cat in sf_entry["categories"] for d in cat["decks"]
            )
            folder_entry["subfolders"].append(sf_entry)
        folder_entry["total_cards"] = sum(sf["total_cards"] for sf in folder_entry["subfolders"])
        result.append(folder_entry)

    return result


# ---------------------------------------------------------------------------
# POST /decks/import — upload a YAML deck
# ---------------------------------------------------------------------------
@app.post("/decks/import")
async def import_deck(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(""),
    folder: str = Form(""),
    subfolder: str = Form(""),
    category: str = Form(""),
):
    global _last_import_ts

    # Rate limit
    now = time.time()
    elapsed = now - _last_import_ts
    if elapsed < COOLDOWN_SECONDS:
        remaining = int(COOLDOWN_SECONDS - elapsed)
        raise HTTPException(
            status_code=429,
            detail=f"Import cooldown active. Try again in {remaining}s.",
        )

    # Size check
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 2 MB limit")

    # Parse YAML
    try:
        data = yaml.safe_load(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {e}")

    if not isinstance(data, list):
        raise HTTPException(status_code=400, detail="YAML must be a list of flashcard objects")

    # Validate cards
    for i, item in enumerate(data):
        if not isinstance(item, dict):
            raise HTTPException(status_code=400, detail=f"Card {i} is not an object")
        if "indication" not in item or "result" not in item:
            raise HTTPException(status_code=400, detail=f'Card {i} missing "indication" or "result"')

    # Generate deck
    final_title = title.strip() or (file.filename or "Untitled").rsplit(".", 1)[0]
    deck_id = f"user-{uuid.uuid4().hex[:12]}"

    conn = _get_db()
    conn.execute(
        """INSERT INTO decks (id, title, description, folder, subfolder, category, cards_json, source)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'upload')""",
        (
            deck_id,
            final_title,
            f"{len(data)} cards • Uploaded deck",
            folder.strip() or None,
            subfolder.strip() or None,
            category.strip() or None,
            json.dumps(data),
        ),
    )
    conn.commit()
    conn.close()

    _last_import_ts = now

    return {
        "id": deck_id,
        "title": final_title,
        "card_count": len(data),
        "message": f'Successfully imported "{final_title}" with {len(data)} cards',
    }


# ---------------------------------------------------------------------------
# DELETE /decks/{deck_id} — delete an uploaded deck (bundled decks protected)
# ---------------------------------------------------------------------------
@app.delete("/decks/{deck_id}")
async def delete_deck(deck_id: str):
    conn = _get_db()
    row = conn.execute("SELECT source FROM decks WHERE id = ?", (deck_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Deck not found")
    if row["source"] == "bundled":
        conn.close()
        raise HTTPException(status_code=403, detail="Cannot delete bundled decks")
    conn.execute("DELETE FROM decks WHERE id = ?", (deck_id,))
    conn.commit()
    conn.close()
    return {"message": "Deck deleted"}
