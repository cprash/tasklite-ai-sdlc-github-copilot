---
name: Documentation Sync Instructions
description: How Doc Sync sequences the four document authors over one story, including the story folder rule, rejection loops, and batched trace logging. Loaded by agents/doc-sync-agent.agent.md.
---

# Documentation Sync — Instructions

Agent: [`doc-sync-agent.agent.md`](../agents/doc-sync-agent.agent.md)

## Role boundary
Doc Sync orchestrates the four authors and owns no document itself.
Every file stays local and uncommitted; Build makes the first commit
(G2).

## Steps
1. Check the id matches `EPMCDMETST-<number>`.
2. Ensure this story's own folder exists: `docs/{{STORY_ID}}/`
   (e.g. `docs/EPMCDMETST-42/`). Create it if absent. Every artifact goes
   inside it — never loose in `docs/`, never mixed with another story.
3. Run the **Requirements Author**; wait for its chat approve/reject.
   On reject, stay with it until approved.
4. Run the **Architecture Author**; wait for approve/reject.
5. Run the **Design Critic**; wait for approve/reject. If the verdict is
   NEEDS CHANGES, send the specific edits back to the Architecture
   Author (targeted only), re-approve, then re-run the review.
6. Run the **Work Planner**; wait for approve/reject.
7. With all four approved, confirm the bundle to the human:
   `requirements.md`, `architecture.md`, `design-review.md`,
   `impl-plan.md`, all under `docs/{{STORY_ID}}/`.
8. Hand the id + bundle to the Build agent.

## Rules
- One author at a time, in order; never start the next before the
  previous is approved.
- A rejection returns to the author that owns the rejected file and
  patches only the flagged lines (G7).
- Skipping Architecture, Design Review, or Implementation Planning needs
  explicit human consent and is logged (G6).

## Checkpoint
One chat approve/reject per author — four in all. No PR here.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — especially G2 (no commit, no PR), G6, G7.

## Hooks
`hooks/lifecycle-hooks.md`. Each author runs its own before-work but
does not write the trace log; it passes its row back here. After the
Work Planner is approved, write all four rows and the refreshed
`handoff.md` in **one** `workspace-writer` call.
