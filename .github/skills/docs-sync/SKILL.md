---
name: docs-sync
description: "Regenerate TaskLite's API documentation (docs/API.md, the README API table, CHANGELOG.md) from the backend's routes, controllers, and Zod validators. Use when routes/controllers/validators change, when docs look stale, or when asked to sync/update documentation."
---

# Automated Documentation Sync

Keeps `docs/API.md`, the README "API endpoint summary" table, and `CHANGELOG.md` in sync with the actual backend source code, so documentation is generated from code instead of hand-maintained.

## When to Use

- After adding, removing, or changing a route, controller, or validator in `backend/src/`.
- When a controller's leading `//` comment (its documented description) changes.
- Before opening a PR that touches the backend API surface.

## How It Works

See [docs/architecture.md](../../../docs/architecture.md) for the full pipeline design and [docs/requirements.md](../../../docs/requirements.md) for the requirements this satisfies.

1. `scripts/docs-sync/extract-app-mounts.mjs` reads `backend/src/app.ts` to resolve each router's mount prefix.
2. `scripts/docs-sync/extract-routes.mjs` parses `backend/src/routes/*.routes.ts` for route registrations.
3. `scripts/docs-sync/extract-validators.mjs` parses `backend/src/validators/*.validators.ts` Zod schemas into field lists.
4. `scripts/docs-sync/extract-controllers.mjs` reads each handler's leading comment, response statuses, and which validator it uses.
5. `scripts/docs-sync.mjs` merges all of the above into an endpoint model, then renders:
   - `docs/API.md` (full reference, fully regenerated every run)
   - The README table (patched in place between `<!-- docs-sync:api-table:start/end -->` markers)
   - `CHANGELOG.md` (a new dated entry is prepended under `## [Unreleased]` only when the endpoint set actually changed, tracked via `docs/.docs-sync-snapshot.json`)

## Procedure

1. Ensure every new/changed controller function has a one-line `//` comment above it (see [api.instructions.md](../../instructions/api.instructions.md)).
2. Run:
   ```bash
   npm run docs:sync
   ```
3. Review the console summary (`updated` / `unchanged` per file) and any warnings (e.g. a handler with no leading comment).
4. Run `npm test` (Node's built-in test runner over `scripts/`) to validate the extractors/renderers still behave correctly if you modified the tool itself.
5. Commit the regenerated `docs/API.md`, `README.md`, `CHANGELOG.md`, and `docs/.docs-sync-snapshot.json` alongside the code change.

## Notes

- Pure Node.js static text parsing — no new dependencies, no database connection, no dynamic `import()`/execution of backend code (see design-review.md finding #5).
- Idempotent: running twice with no source changes reports "no changes" the second time.
