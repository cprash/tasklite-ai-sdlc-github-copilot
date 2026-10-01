# Implementation Plan — EPMCDMETST-66637: Enter edit mode for a task to change its title

## Phases
1. Lift shared edit-mode state into `TaskList` so exclusivity (only one
   task editing at a time) is guaranteed structurally.
2. Add the Edit control and the conditional edit-mode render to
   `TaskItem`.
3. Wire up focus and cursor placement so edit-mode entry is keyboard
   accessible.

## Tasks
| Id | Task | Effort | Waits on |
|---|---|---|---|
| T1 | Add `editingTaskId` state to `TaskList` (`frontend/src/components/TaskList.tsx`); pass each `TaskItem` `isEditing={editingTaskId === task.id}` and an `onStartEdit(taskId)` callback | MED | none |
| T2 | Add an Edit control (button) to `TaskItem` (`frontend/src/components/TaskItem.tsx`) that calls `onStartEdit(task.id)` | LOW | T1 |
| T3 | In `TaskItem`, when `isEditing` is true, render a text input prefilled with `task.title` instead of the static title view | MED | T2 |
| T4 | Add a `useRef` + `useEffect` in `TaskItem` to focus the edit input and place the cursor when it mounts (satisfies keyboard-accessible entry and the focus acceptance criterion) | MED | T3 |

## Blocked
None.

## Effort roll-up
1 LOW, 3 MED. Overall: MED — small, frontend-only, contained to two
components, no backend or entity change.
