# Requirements — EPMCDMETST-66637: Enter edit mode for a task to change its title

## Story at a glance
Source: Confluence (Task Lite - Release 2, https://epamrahulsharma7.atlassian.net/wiki/spaces/TaskLite/pages/40599555/Task+Lite+-+Release+2).
As a user, I want to enter edit mode for a task, so that I can change its title.
Estimate: 3 SP. Priority: High. Recommended implementation order: 1.
Owner: [pending]. Status: [pending].

## What it must do (functional)
- Each task in the task list has an Edit control
- Activating the Edit control for a task switches that task into edit mode, showing a text input prefilled with the task's current title
- When the edit input receives focus, the cursor is placed in the input and the current title is available for editing
- Only one task is in edit mode at a time — entering edit mode for one task leaves all other tasks in view mode
- Entering edit mode requires no API call

## How well it must do it (non-functional)
- Edit mode entry is keyboard accessible (the Edit control and the resulting input must be operable without a mouse)
- None beyond standard client-side behavior — no new security surface, since entering edit mode makes no API call

## Acceptance criteria
- Given the task list is displayed with at least one task, when I activate the Edit control for a task, then that task switches into edit mode showing a text input prefilled with the current title
- Given a task is in edit mode, when I focus the edit input, then the cursor is placed in the input and the current title is available for editing
- Given multiple tasks exist, when I enter edit mode for one task, then only that task is in edit mode and the others remain in view mode

## Decisions captured
- Constraint: no additional constraints beyond the story — the inline edit pattern as stated is acceptable
- Dependency: none; frontend-only UI state, self-contained
- Definition of done: edit mode can be entered, entry is keyboard accessible, and no API call is required to enter edit mode
- NFR: no performance or security expectations beyond standard client-side behavior; no new security surface since no API call is made
- Exclusions: saving/persisting the edited title, canceling edit mode, and input validation are explicitly out of scope

## Explicitly out of scope
- Persisting/saving the edited title (no API call)
- Canceling or exiting edit mode
- Validation of the edited title
