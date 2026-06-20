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
    
    # Run migrations for new columns if they don't exist
    try:
        conn.execute("ALTER TABLE decks ADD COLUMN author TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
        
    try:
        conn.execute("ALTER TABLE decks ADD COLUMN organization TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
        
    conn.close()


# ---------------------------------------------------------------------------
# Bundled deck loader
# ---------------------------------------------------------------------------
def _parse_yaml_file(path: Path):
    try:
        with open(path) as f:
            data = yaml.safe_load(f)
        return data
    except Exception:
        return None


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

            data = _parse_yaml_file(yaml_path)
            
            cards = []
            if isinstance(data, list):
                cards = data
            elif isinstance(data, dict) and "cards" in data and isinstance(data["cards"], list):
                cards = data["cards"]
                
            if not cards:
                continue

            part_suffix = f"-pt{part_num}" if part_num else ""
            part_label = f" ({part_num})" if part_num else ""
            deck_id = f"german-{sublevel.replace('.', '-').lower()}-{category}{part_suffix}"

            conn.execute(
                """INSERT OR REPLACE INTO decks
                   (id, title, description, folder, subfolder, level, category, part, cards_json, source, author, organization)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
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
                    "YASSSF",
                    None
                ),
            )

    # Legacy decks
    for legacy_file, deck_id, title, desc in [
        ("sample_deck.yaml", "german-idioms", "German Idioms & Nuances", "Advanced German vocabulary and expressions"),
        ("kannada_colors.yaml", "kannada-colors", "Kannada Colors", "Colors in Kannada script with pronunciation"),
    ]:
        path = BUNDLED_DECKS_DIR / legacy_file
        if path.exists():
            data = _parse_yaml_file(path)
            cards = []
            if isinstance(data, list):
                cards = data
            elif isinstance(data, dict) and "cards" in data and isinstance(data["cards"], list):
                cards = data["cards"]
            
            if cards:
                conn.execute(
                    """INSERT OR REPLACE INTO decks
                       (id, title, description, folder, subfolder, level, category, part, cards_json, source, author, organization)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (deck_id, title, f"{len(cards)} cards • {desc}", None, None, None, None, None, json.dumps(cards), "bundled", "YASSSF", None),
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
    query = "SELECT id, title, description, folder, subfolder, level, category, part, source, author, organization FROM decks WHERE 1=1"
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
        """SELECT id, title, description, folder, subfolder, level, category, part, source, author, organization,
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
            "author": r["author"],
            "organization": r["organization"],
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


def _clean_path(path: str) -> str:
    """Sanitizes category/folder paths, allowing slashes up to depth 32."""
    if not path:
        return ""
    # Only keep alphanumeric, spaces, hyphens, underscores, and slashes
    cleaned = re.sub(r"[^\w\s\-_/]", "", path)
    # Remove leading/trailing slashes and collapse multiple slashes
    cleaned = re.sub(r"/+", "/", cleaned).strip("/")
    parts = cleaned.split("/")
    if len(parts) > 32:
        parts = parts[:32]
    return "/".join(parts)


# ---------------------------------------------------------------------------
# POST /decks/import — upload a YAML deck
# ---------------------------------------------------------------------------
@app.post("/decks/import")
async def import_deck(
    request: Request,
    file: UploadFile = File(...),
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
        raise HTTPException(status_code=400, detail=f"Invalid YAML parsing error: {e}")

    # Process structure: allow direct list or dict with 'cards' list and metadata
    cards = []
    meta = {}

    if isinstance(data, list):
        cards = data
    elif isinstance(data, dict):
        if "cards" not in data or not isinstance(data["cards"], list):
            raise HTTPException(status_code=400, detail="YAML dictionary must contain a 'cards' list")
        cards = data["cards"]
        meta = data
    else:
        raise HTTPException(status_code=400, detail="YAML must be a list of flashcards or a dictionary with metadata and 'cards'")

    # Validate cards
    for i, item in enumerate(cards):
        if not isinstance(item, dict):
            raise HTTPException(status_code=400, detail=f"Card {i} is not an object")
        if "indication" not in item or "result" not in item:
            raise HTTPException(status_code=400, detail=f'Card {i} missing "indication" or "result"')

    # Extract metadata (either from the YAML or default to filename)
    title = meta.get("title", "").strip() or meta.get("name", "").strip() or (file.filename or "Untitled").rsplit(".", 1)[0]
    description = meta.get("description", "").strip() or f"{len(cards)} cards • Uploaded deck"
    author = meta.get("author", "").strip() or None
    organization = meta.get("organization", "").strip() or meta.get("org", "").strip() or None
    
    # Use clean_path for folder, subfolder, and category to prevent injection
    folder = _clean_path(meta.get("folder", "").strip() or meta.get("collection", "").strip()) or None
    subfolder = _clean_path(meta.get("subfolder", "").strip()) or None
    
    # Path inside category field allowed by user: "make category folder-like separated by / for depth"
    category = _clean_path(meta.get("category", "").strip() or meta.get("path", "").strip()) or None

    deck_id = f"user-{uuid.uuid4().hex[:12]}"

    conn = _get_db()
    conn.execute(
        """INSERT INTO decks (id, title, description, folder, subfolder, category, cards_json, source, author, organization)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'upload', ?, ?)""",
        (
            deck_id,
            title,
            description,
            folder,
            subfolder,
            category,
            json.dumps(cards),
            author,
            organization
        ),
    )
    conn.commit()
    conn.close()

    _last_import_ts = now

    return {
        "id": deck_id,
        "title": title,
        "card_count": len(cards),
        "message": f'Successfully imported "{title}" with {len(cards)} cards',
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
