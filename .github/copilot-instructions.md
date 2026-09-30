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
- Follow the Agentic SDLC artifacts in `docs/` (`requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`) when adding a new feature; update them alongside the code.
