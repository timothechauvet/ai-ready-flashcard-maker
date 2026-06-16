# YASSSF (Yet Another Simple Shared Study Flashcards)

YASSSF is a mobile-first, high-performance flashcard maker application. It is designed with a premium, dynamic, and young aesthetic, relying on a clean white mode and dark slate green/grey accents.

## Architecture

YASSSF is built with a modern, cloud-ready stack:

### Frontend Layer

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: Vanilla CSS with global architecture for extreme flexibility. Dark Slate Green/Grey primary accent. Mobile-first responsive design.
- **Components**: Functional, reusable Svelte 5 components with interactive micro-animations.

### Backend & Data Layer

- **Database & Auth**: [Supabase](https://supabase.com/)
  - Used for User Accounts and Authentication.
  - Used for storing flashcard decks and metadata.
- **API**: Handled natively within SvelteKit's `/api` endpoints and Supabase direct connections.

### Application Flow & Pages

1. `/`: Home page or redirect to exploration/dashboard.
2. `/explore`: Public Flashcards Deck Database Browser.
   - Shows deck titles, descriptions, authors.
   - Flagging functionality with secure URL verification to prevent abuse.
3. `/library`: User's personal collection (Uploaded and Favorited).
4. `/upload`: YAML-based flashcard importer.
   - Parses YAML files (max 1MB).
   - Format: `indication` (req), `result` (req), `picture_url` (opt), `category` (opt).
5. `/play/[deckId]`: Interactive Flashcard Player.
   - Supports both `random` and `sequential` playback.
6. `/settings`: Account Management.

### Deployment & CI/CD

- **Containerization**: Built and packaged via Docker.
- **Orchestration**: Fully Kubernetes-ready with Deployments and Services configurations (`k8s/`).
- **CI Pipelines**: Configured with GitHub Actions for automated linting, checking (`npm run check`), security scanning (`gitleaks`), and Docker image publishing to GHCR.

## Development

```sh
# Install dependencies
npm install

# Start the dev server
npm run dev

# Run Svelte checks and TypeScript validation
npm run check

# Build for production (Node Adapter)
npm run build
```

## AI Agent Integration

This project is actively maintained and built alongside Autonomous AI Agents.
**If you are an AI Agent, please refer to [AGENTS.md](./AGENTS.md) for coordination instructions, behavioral guidelines, and assignment workflows.**
