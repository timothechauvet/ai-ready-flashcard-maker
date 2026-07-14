# YASSSF — Path to Target Architecture: Plan Index

**Date:** 2026-07-07
**Target state:** as described in [README.md](../README.md) — Supabase for auth + deck storage, API via SvelteKit `/api` endpoints, pages `/`, `/explore` (with flagging), `/upload` (1 MB YAML), `/play/[deckId]`, `/settings`; free features: backend saving, personal account notes, private decks, exam mode.

## Where the codebase actually is today (verified 2026-07-07)

| Area | README target | Current reality |
|---|---|---|
| Database & auth | Supabase | **FastAPI + SQLite** on a single-node PVC (`backend/main.py`). `src/lib/supabase.ts` exists but is **imported nowhere**. Zero tables, zero auth. |
| API | SvelteKit `/api` endpoints | No server code at all — no `+page.server.ts`, no `+server.ts`, no `hooks.server.ts`. Browser fetches `https://api.yasssf.com` directly. |
| Deck content | Stored in DB | 330 YAML files **duplicated** in `src/lib/german/` and `backend/decks/german/`. The frontend copy is compiled into the `/play` client chunk: **652 KB raw / 127 KB gzip** shipped to every player. |
| `/settings` | Account management | Does not exist. |
| Private decks, notes, backend saving | Free features | Impossible — no accounts. Progress lives in `localStorage` only. |
| Flagging on `/explore` | Secure URL verification | Does not exist. |
| Upload | 1 MB max | 2 MB max, anonymous, one **global** 60 s cooldown; unauthenticated `DELETE /decks/{id}` on the public API can delete any uploaded deck. |
| Card format | `indication`, `result`, `picture_url` (opt), `category` (opt) | Player renders `pronunciation`/`clue` extras but **not** `picture_url` or `category`. |

Baseline health: `pnpm run check` → 0 errors; `pnpm run build` → passes.
Note: the working tree has uncommitted dependency bumps in `package.json`/`pnpm-lock.yaml`. Commit those first (`:arrow_up: Update dependencies`) so plan diffs stay clean.

## The five changes, ranked by leverage

1. **[Plan 01 — Supabase data foundation](./01-supabase-data-foundation.md)**
   Create the `decks` schema with RLS and seed the full 330-deck corpus into Supabase. Nothing else in the roadmap (accounts, private decks, notes, flagging, saving) can be built until the data lives in Supabase. Removes the dual-source-of-truth and the SQLite single-point-of-failure. Pure additive change — zero app code touched, zero deploy risk.

2. **[Plan 02 — Server-side read path](./02-server-read-path.md)**
   Move `/explore` and `/play` onto SvelteKit server `load` functions backed by Supabase, and delete the 1.5 MB YAML corpus from the client bundle (652 KB chunk → a few KB). Biggest single UX win available (mobile-first product shipping half a megabyte of vocab to every visitor), makes the public deck browser SSR/SEO-friendly, and implements the README's "API handled natively within SvelteKit".

3. **[Plan 03 — Auth + `/settings`](./03-auth-and-settings.md)**
   Supabase Auth wired through `@supabase/ssr` (hooks, session-aware locals), login page, `/settings` account page, profiles table. This is the gate in front of every remaining roadmap feature: private decks, personal notes, backend saving, upload ownership.

4. **[Plan 04 — Upload ownership, private decks, FastAPI decommission](./04-upload-ownership-and-backend-decommission.md)**
   Rebuild upload as an authenticated SvelteKit `/api/decks` endpoint writing to Supabase (1 MB spec limit, per-user rate limit, `is_public` toggle), add `/library`, render `picture_url`/`category` per the spec, migrate live user uploads, then delete the entire Python backend + its k8s/CI footprint. Completes the architecture migration, delivers two roadmap features, and closes the unauthenticated-DELETE hole.

5. **[Plan 05 — Deck flagging with secure URL verification](./05-deck-flagging.md)**
   HMAC-signed, expiring flag tokens + one-flag-per-reporter dedup + auto-hide threshold. The README's explicit trust & safety requirement for a public UGC database — it becomes urgent the moment plan 04 makes uploads first-class.

**Deliberately not in the top 5** (leaf features that unblock nothing else): exam mode on `/play`, syncing localStorage progress + personal notes to accounts (both need plan 03 first), and a dead-code sweep (plan 02 removes most of it as a side effect).

## Execution rules (apply to every plan)

- Plans must run **in order**; each lists its prerequisites and is standalone otherwise.
- Follow [CLAUDE.md](../CLAUDE.md): surgical changes only, match existing style, gitmoji commits.
- After every plan: `pnpm run check` and `pnpm run build` must pass before committing.
- Package manager is **pnpm** (v11, `engine-strict`). Note: `pnpm-workspace.yaml` enforces a 7-day minimum release age for new deps — if `pnpm add` rejects a fresh release, pin the previous version instead.
- Steps tagged **[OPERATOR]** need a human (dashboard access, secrets, kubectl). Stop and ask rather than guessing credentials.
- Secrets live in `.env` (gitignored). Never commit or print them.
