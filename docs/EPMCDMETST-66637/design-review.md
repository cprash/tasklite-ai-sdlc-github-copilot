# Design Review — EPMCDMETST-66637: Enter edit mode for a task to change its title

## What was reviewed
- docs/EPMCDMETST-66637/requirements.md
- docs/EPMCDMETST-66637/architecture.md

## Findings
| Severity | Lens | What's wrong | Suggested fix |
|---|---|---|---|
| LOW | Error Handling | If a task is removed from the list while it is the one being edited (e.g. via an existing delete action elsewhere in the app), `editingTaskId` in `TaskList` goes stale — harmless today since no `TaskItem` renders for a missing id and real ids aren't reused, but worth a one-line note so it's not mistaken for a bug later | Carry a short code comment / implementation-plan note that `editingTaskId` is intentionally left unset-on-removal because it has no visible effect |
| LOW | Scalability | Lifting `editingTaskId` into `TaskList` means every `TaskItem` sibling re-renders on each edit-mode toggle | Acceptable at current TaskLite list sizes; wrap `TaskItem` in `React.memo` only if lists grow large enough to matter |

## Decisions we agreed on
- Keep the lifted-state design (`editingTaskId` owned by `TaskList`) — it's what guarantees AC3 (only one task in edit mode at a time); per-item local state would not enforce that
- No new dependency — plain `useState`/`useRef`/`useEffect` is sufficient for prefill + focus/cursor placement
- Accept the sibling re-render cost at current scale rather than adding `React.memo` preemptively

## Changes the architecture needs
None — good as is. The two LOW findings are implementation notes to carry
into `impl-plan.md`, not architecture revisions.

## Verdict
APPROVED — design satisfies all three acceptance criteria on the declared
stack with no new entity, API, or dependency surface.
