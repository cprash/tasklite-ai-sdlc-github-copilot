# TaskLite Project Guidelines

TaskLite is a small task-management app: Express + TypeScript + Prisma/SQLite backend, React + TypeScript + Vite frontend. See [README.md](../README.md) for setup and [docs/architecture.md](../docs/architecture.md) for system design.

## Architecture

- `backend/src/routes` → `controllers` → `validators` (Zod) → Prisma. One router per resource, mounted under `/api` in `app.ts`.
- `frontend/src` calls the API only through `services/taskApi.ts` — components never call `fetch` directly.
- Documentation (`docs/API.md`, the README API table, `CHANGELOG.md`) is **generated, not hand-written** — see [docs-sync skill](./skills/docs-sync/SKILL.md).

## Build and Test

- Backend: `cd backend && npm install && npm run dev` (starts on port 3000). Tests: `npm test` (Vitest).
- Frontend: `cd frontend && npm install && npm run dev` (starts on port 5173).
- Docs sync (repo root): `npm run docs:sync`. Tests: `npm test` (Node's built-in test runner, `scripts/`).
- Prisma schema changes require `npx prisma migrate dev` from `backend/`.

## Conventions

- Path-specific rules live in `.github/instructions/` (`api.instructions.md`, `frontend.instructions.md`) — read those before editing backend or frontend code.
- `docs/requirements.md`, `architecture.md`, `design-review.md`, and `impl-plan.md` are living SDLC documents for the whole application — backend/API **and** frontend/UI — not a one-time snapshot and not API-only. For **every** story (API or UI), analyze each of the four and update whichever ones actually change as a result (new/changed requirements, architecture impact, review findings, follow-up tasks) — append a dated, story-tagged section rather than rewriting prior history. If a story genuinely doesn't affect a given file, leave it as is.
