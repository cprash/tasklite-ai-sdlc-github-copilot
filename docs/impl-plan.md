# Implementation Plan: Automated Documentation Sync

Ordered by dependency — each task lists what it's blocked by.

| # | Task | Depends On | Blocked Until |
|---|------|-------------|----------------|
| 1 | Scaffold `scripts/docs-sync/` folder + root `package.json` with `docs:sync` and `test` scripts. | — | Nothing (can start immediately). |
| 2 | Implement `extract-app-mounts.mjs` (parses `backend/src/app.ts` for `app.use(prefix, router)`). | Task 1 | — |
| 3 | Implement `extract-routes.mjs` (parses `*.routes.ts`, joins with mount prefixes). | Task 2 | Needs mount map from Task 2. |
| 4 | Implement `extract-validators.mjs` (parses `*.validators.ts` Zod schemas into field lists). | Task 1 | — (independent of Tasks 2–3, can be built in parallel). |
| 5 | Implement `extract-controllers.mjs` (leading comment, status codes, `HttpError` calls, schema-usage detection). | Task 4 | Needs validator names/fields to resolve `<schema>.safeParse` references. |
| 6 | Build the endpoint model assembler in `docs-sync.mjs` (merges routes + controllers + validators into the model described in `architecture.md`). | Tasks 3, 5 | Needs both extractors' output shapes finalized. |
| 7 | Implement `render-api-doc.mjs` (writes `docs/API.md`). | Task 6 | Needs the endpoint model. |
| 8 | Add marker comments to `README.md` (`<!-- docs-sync:api-table:start/end -->`) and implement `render-readme-table.mjs`. | Task 6 | Needs the endpoint model; marker comments must exist before the patcher can run. |
| 9 | Implement `render-changelog.mjs` + snapshot read/write (`docs/.docs-sync-snapshot.json`), including the "first run" and "no changes" special cases from the design review. | Task 6 | Needs the endpoint model. |
| 10 | Wire everything together in `scripts/docs-sync.mjs` (CLI entry, console summary, exit codes). | Tasks 7, 8, 9 | Needs all three renderers. |
| 11 | Create `CHANGELOG.md` with an initial `## [Unreleased]` header if it doesn't already exist. | Task 1 | — (can happen any time before Task 9 first runs). |
| 12 | Write automated tests (`scripts/docs-sync/*.test.mjs`) covering: happy-path full generation, missing-comment fallback, enum validator constraint, idempotent second run. | Tasks 2–10 | Needs the implementation to test against. |
| 13 | Run `npm run docs:sync` once for real, review generated `docs/API.md`, README table, and `CHANGELOG.md` output. | Task 12 | Needs a passing implementation. |

## Not Blocked / Can Start in Parallel

- Task 1 (scaffolding) and Task 4 (validator extractor) have no dependency on each other and can start immediately.
- Task 11 (CHANGELOG.md skeleton) has no code dependency and can be done any time.

## Explicitly Blocked Tasks

- Task 3 is blocked until Task 2 (mount-prefix map) exists — otherwise route paths would be wrong (design review finding #1).
- Task 5 is blocked until Task 4 — the controller extractor needs to know valid schema names to correctly detect `<schema>.safeParse(...)` usage.
- Task 6 (and everything after it) is blocked until both extractor branches (routes+controllers, and validators feeding into controllers) are done.
- Task 12 (tests) is blocked until the implementation exists to exercise.

---

## Story: 2026-09-30 — Update an existing task's title (PATCH /api/tasks/:id)

| # | Task | Depends On | Status |
|---|------|-------------|--------|
| 14 | Add `updateTaskTitleSchema` to `task.validators.ts`. | — | Done |
| 15 | Add `updateTaskTitle` controller (mirrors `updateTaskStatus`), with its required leading comment. | Task 14 | Done |
| 16 | Register `PATCH /tasks/:id` → `updateTaskTitle` in `tasks.routes.ts`. | Task 15 | Done |
| 17 | Add a backend vitest suite for `updateTaskTitle`; wire up `backend`'s `test` script (was a placeholder). | Task 15 | Done |
| 18 | Fix `tsconfig.json` to exclude `*.test.ts` from the build so vitest doesn't double-run compiled tests from `dist/`. | Task 17 | Done |
| 19 | Fix the docs-sync implicit-`200` gap found while live-testing this story (design-review.md finding #7). | Task 16 | Done |
| 20 | Run `npm run docs:sync`; verify `docs/API.md`, README table, and `CHANGELOG.md` all update correctly. | Tasks 16, 19 | Done |
