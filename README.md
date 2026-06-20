# YASSSF (Yet Another Simple Shared Study Flashcards) 🃏

> *A fully AI-ready app to generate and consume flashcards, heavily utilizing AI for content extraction (e.g. from PDFs for CEFR German decks).*

![SvelteKit](https://img.shields.io/badge/-SvelteKit-blue.svg) ![Docker](https://img.shields.io/badge/-Docker-blue.svg) ![Supabase](https://img.shields.io/badge/-Supabase-blue.svg) ![AI](https://img.shields.io/badge/-AI-blue.svg)

## 🏗️ Architecture
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
3. `/upload`: YAML-based flashcard importer.
   - Parses YAML files (max 1MB).
   - Format: `indication` (req), `result` (req).
4. `/play/[deckId]`: Interactive Flashcard Player.
5. `/settings`: Account Management.

## Product Roadmap & Pricing Model
### Free Features
- **Backend Saving**: Persist your decks to the database.
- **Personal Account Notes**: Attach notes and annotations to your study profile.
- **Private Decks**: Keep your custom decks private, separate from the public explorer.
- **Exam Mode**: A structured testing environment with score reporting.


## 💻 Tech Stack
- **SvelteKit**
- **Node.js**
- **Docker**
- **Supabase**
- **Vanilla CSS**


---
*Generated with care by Homardless 🦞*
