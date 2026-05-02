# AI Agents Coordination Document

This project (YASSSF) uses autonomous AI agents to accomplish tasks.
Each agent working on this project must strictly adhere to the following rules and instructions.

## 🧠 Behavioral Guidelines (Andrej Karpathy)
These guidelines reduce common LLM coding mistakes. Bias toward caution over speed.

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State assumptions explicitly. If uncertain, ask.
- Present multiple interpretations - don't pick silently.
- Push back if a simpler approach exists.
- If unclear, stop and ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code or formatting.
- Match existing style.
- Remove orphans created by YOUR changes (imports/variables).
- Every changed line should trace directly to the request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., "Write tests for X, then make them pass").
- For multi-step tasks, state a brief plan:
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]

## Agent Workflow
1. **Assign yourself a task**: Read `TODO.md`. Pick an unassigned task. Edit `TODO.md` to replace "Unassigned" with a randomly chosen agent name and indicate you are working on it.
2. **Read CEO.md**: Before doing your task, check `CEO.md` for any strategic tasks or requests from the CEO. If there are new items, triage them into `TODO.md` and prioritize them if needed.
3. **Execute**: Do your task according to the rules above.
4. **Test**: Run `npm run check` and `npm run build` to ensure the project works.
5. **Commit**: Use gitmoji for commit messages (e.g., `:sparkles: New feature blabla`). Push if applicable.

## Project Context
- **Name**: YASSSF (Yet Another Simple Shared Study Flashcards)
- **Architecture**: See [README.md](./README.md) for full stack and architecture details.
- **Tech Stack**: SvelteKit, Supabase, Vanilla CSS, Kubernetes
- **Design Philosophy**: Mobile-first, dynamic, young, fast, premium white mode with dark slate green/grey accent color.
- **YAML Format**: Max 1MB. Format: `indication` (req), `result` (req), `picture_url` (opt), `category` (opt).

## 🤖 AI Generation Prompt
Copy and paste this prompt into an AI agent (ChatGPT, Claude, etc.) to generate compatible YAML decks:

```text
Act as an expert educator. Generate a high-quality flashcard deck in YAML format about [TOPIC].
The output must be a valid YAML list of objects with these exact fields:
- indication: (string, required) The question or front side of the card.
- result: (string, required) The answer, meaning, or back side of the card.
- picture_url: (string, optional) A direct URL to a relevant image.
- category: (string, optional) A tag or category for organization.

Example format:
- indication: "What is the capital of Japan?"
  result: "Tokyo"
  category: "Geography"
- indication: "What does HTML stand for?"
  result: "HyperText Markup Language"
  category: "Technology"

Ensure the YAML is clean and correctly indented. Total content must be under 1MB.
```
