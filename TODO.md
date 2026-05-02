# Project Task List

This file tracks all remaining tasks for the YASSSF project. Agents must select a task, add their random name, and work on it.

- [ ] Set up global CSS architecture (Vanilla CSS, dark slate green/grey, Outfit font) / Unassigned
- [ ] Initialize Supabase Client in `src/lib/supabase.ts` / Unassigned
- [ ] Build `/settings` page for account management / Unassigned
- [ ] Build `/explore` page for public decks (with flagging feature) / Unassigned
- [ ] Build `/library` page for favorites and uploaded decks / Unassigned
- [ ] Build `/play/[deckId]` page with sequential/random toggles / Unassigned
- [ ] Build `/upload` page with YAML parsing logic (1MB limit, validation) / Unassigned
- [ ] Add AI prompt instructions for generating YAML decks / Unassigned
- [ ] Wire up lazy loading for flashcards in Supabase queries / Unassigned
- [x] Fix Docker build error (sync package-lock.json) / Atlas
- [x] Fix Dependabot vulnerability (cookie < 0.7.0) / Atlas
- [x] Verify Kubernetes files (`Dockerfile`, `k8s/deployment.yaml`, `k8s/service.yaml`) / Antigravity
- [x] Initialize a docker compose for quick testing / Antigravity
- [x] Add github actions for CI, docker build, npm run check, secrets analysis (gitleaks), pushing images to ghcr / Antigravity
