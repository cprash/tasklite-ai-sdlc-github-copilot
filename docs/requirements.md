# Requirements: Automated Documentation Sync

## Source

- User story source: `docs/GitHub Copilot Capstone Project.docx` (capstone use case: "Automated Documentation Sync").
- Clarifying questions asked to the user and answers received:
  1. **Scope** — Sync the full documentation suite: API reference doc, README's endpoint/feature summary, and a CHANGELOG. → **Full doc suite**.
  2. **Trigger** — Run on demand via an npm script. → **Manual script** (`npm run docs:sync`).
  3. **Process** — Follow the full 8-step Agentic SDLC (requirements → architecture → design review → plan → implementation → review → verify → PR).

## Problem Statement

TaskLite's documentation (`README.md` API table, no dedicated API reference, no changelog) is maintained by hand and drifts out of sync with the actual Express routes, controllers, and Zod validators as the backend evolves. We need a repeatable, automated way to regenerate accurate documentation directly from the source of truth (the backend code) whenever a developer runs it.

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Provide a command (`npm run docs:sync`, runnable from the repo root) that regenerates documentation from the current backend source code. |
| FR-2 | Generate a full API reference at `docs/API.md` listing every route: HTTP method, path, description, request body schema (field, type, required, constraints), and possible response statuses. |
| FR-3 | The description for each endpoint must come from a one-line doc comment directly above its controller function, so the code comment is the single source of truth. |
| FR-4 | Request body schema fields must be derived from the corresponding Zod validator (`backend/src/validators/*.ts`), not hand-written. |
| FR-5 | Update the "API endpoint summary" table in the root `README.md` in place (between marker comments) to match the generated reference, without touching the rest of the README. |
| FR-6 | Maintain a `CHANGELOG.md` at the repo root. Each sync run compares the current endpoint set against the last recorded snapshot and, if there are differences, prepends a dated entry under `## [Unreleased]` describing added/changed/removed endpoints. If nothing changed, no changelog entry is added. |
| FR-7 | The tool must clearly report, on the console, what it changed (files written, endpoints added/removed) after each run. |
| FR-8 | Running the sync twice in a row with no source changes must be idempotent (second run reports "no changes", does not create duplicate changelog entries). |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | No new runtime dependencies — implemented with Node.js built-ins only (works without `npm install` in `backend/`). |
| NFR-2 | Must not require a live database connection or generated Prisma client to run (pure static source parsing). |
| NFR-3 | Must be safe to re-run repeatedly (no manual cleanup needed); writes are deterministic for identical input. |
| NFR-4 | Parsing failures (e.g., a route with no matching controller, or a controller with no leading comment) must produce a clear warning, not a crash, and fall back to a sensible default. |
| NFR-5 | Script must exit with a non-zero status code if it encounters a hard error (e.g., missing source directories), so it can later be wired into CI if desired. |

## Out of Scope

- Automatic CI enforcement/blocking of stale docs (explicitly deferred; trigger is manual only per user decision).
- Documenting the frontend components or non-HTTP internals.
- Generating OpenAPI/Swagger spec files (only Markdown output for this iteration).

## Acceptance Criteria

- Running `npm run docs:sync` from the repo root regenerates `docs/API.md`, updates the README table, and updates `CHANGELOG.md` (only when there are actual changes).
- All 4 current endpoints (`GET /api/health`, `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`) appear correctly in the generated docs with accurate methods, paths, and request schemas.
- Adding a new route/controller/validator and re-running the script picks it up automatically with no manual doc edits required.
- Automated tests cover: happy path generation, an endpoint with no leading comment (fallback), and a validator field with an enum constraint.
