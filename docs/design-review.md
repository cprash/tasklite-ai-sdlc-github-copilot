# Design Review: Automated Documentation Sync

Reviewer: GitHub Copilot (acting as senior reviewer), evaluating `architecture.md` against `requirements.md` before implementation.

## Findings

| # | Area | Risk / Gap | Severity | Resolution |
|---|------|------------|----------|------------|
| 1 | Route path prefix | `app.ts` mounts routers with `app.use("/api", healthRouter)` / `app.use("/api", tasksRouter)`. The original architecture had the route extractor read only `*.routes.ts`, which do **not** contain the `/api` prefix — hardcoding `/api` in the extractor would silently break if the mount point ever changes. | Medium | Added an **App Mount Extractor** component that parses `backend/src/app.ts` for `app.use("<prefix>", <routerVar>)` and maps each router variable to its real prefix; the route extractor joins prefix + path. `architecture.md` updated (see "Updates Made" below). |
| 2 | Comment-as-description parsing | If a controller function has no leading `//` comment, or has a multi-line block comment, the parser could produce an empty/wrong description. | Medium | Confirmed NFR-4 already requires a graceful fallback (`"No description provided."` + console warning) rather than a crash. Added this exact fallback string to the design so renderers have a fixed value to assert on in tests. |
| 3 | Changelog diff granularity | Unclear whether a description-only edit (no path/method change) should count as a "change" worth a changelog entry. | Low | Decision: yes — the snapshot fingerprint includes `description` and `requestFields`, so any doc-visible change produces an entry. This matches FR-6 ("differences" is doc-visible differences, not just route additions/removals). |
| 4 | First run (no snapshot yet) | Every endpoint would be reported as "added", which is correct but should be worded as an initial baseline, not N separate additions, to avoid a noisy changelog entry. | Low | Renderer special-cases "no prior snapshot" → single entry: `Initial automated documentation baseline (N endpoints).` |
| 5 | Security | Original design already avoids dynamic `import()`/`eval` of source files (static text parsing only), so the tool never executes application code. | None (validated, no change) | Confirmed as a documented decision — no untrusted code execution, no secrets are read or emitted (the tool only touches routes/controllers/validators, never `.env`). |
| 6 | Idempotency | Re-running with a resolved diff already written should produce "no changes" on the very next run. | None (validated, no change) | Confirmed by design: snapshot is only rewritten when a diff exists, so a second consecutive run compares against the just-written snapshot and finds none. |

## Agreed Design Decisions

1. Add the App Mount Extractor (`scripts/docs-sync/extract-app-mounts.mjs`) as a new pipeline step before route extraction.
2. Missing description → fixed fallback string `"No description provided."`, plus a console warning naming the handler.
3. Snapshot fingerprint = `{ method, path, description, requestFields }`; any field difference triggers a changelog entry.
3. First-ever run produces one summarizing changelog line instead of one line per endpoint.
5. No dynamic import/execution of backend source — static parsing only (carried forward, reconfirmed).

## Architecture Updates Made

- `docs/architecture.md`: added the App Mount Extractor component to the component table and flow diagram, and updated the route extractor's responsibility to consume prefixes from it instead of assuming `/api`.
