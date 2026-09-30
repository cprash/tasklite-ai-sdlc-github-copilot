---
description: "Frontend conventions for TaskLite's React + TypeScript + Vite app. Use when adding or editing components, types, or API calls."
applyTo: "frontend/src/**"
---
# Frontend Conventions

- All backend calls go through `services/taskApi.ts`; components must not call `fetch` directly. Each API function returns a typed `Promise<Task | Task[] | void>` and routes errors through `handleResponse`.
- Shared types (`Task`, `TaskStatus`) live in `types/task.ts` and must stay in sync with `backend/prisma/schema.prisma`'s `Task` model and `TaskStatus` enum.
- Components (`TaskForm`, `TaskList`, `TaskItem`) are function components with typed props; keep presentation and data-fetching separate — fetching/mutation logic stays in `App.tsx` or a hook, not inside list/item components.
- Match the existing TypeScript strictness in `tsconfig.app.json`; don't introduce `any`.
- UI stories go through the same living SDLC docs as API stories — analyze `docs/requirements.md`, `architecture.md`, `design-review.md`, and `impl-plan.md` and update whichever apply (see the root `copilot-instructions.md` Conventions section).
