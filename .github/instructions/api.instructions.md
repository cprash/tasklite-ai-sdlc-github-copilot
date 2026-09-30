---
description: "Backend/API conventions for TaskLite's Express + Prisma + Zod stack. Use when adding or editing routes, controllers, or validators."
applyTo: "backend/src/**"
---
# Backend API Conventions

- Routes go in `routes/*.routes.ts` (one `Router()` per file, mounted with a prefix in `app.ts`). Register one route per statement: `router.<method>("/path", handlerOrArrowFn)` — this exact shape is required for [`npm run docs:sync`](../skills/docs-sync/SKILL.md) to parse routes correctly.
- Every exported controller function in `controllers/*.controller.ts` **must** have a single-line `//` comment directly above it describing what it does — this comment is the source of truth for the generated API docs (`docs/API.md` and the README table), not a separate description.
- Request bodies are validated with a Zod schema in `validators/*.validators.ts`, invoked as `<schema>.safeParse(req.body)` in the controller. Keep schemas as a flat `z.object({...})` — the docs-sync tool statically parses this shape.
- Throw `HttpError(status, message)` (from `utils/httpError.ts`) for expected client errors (400/404); let unexpected errors propagate to `next(error)` for the global `errorHandler` middleware.
- After changing a route, controller, or validator, run `npm run docs:sync` from the repo root to regenerate `docs/API.md`, the README table, and `CHANGELOG.md`.
