---
name: Documentation Sync
description: Covers capstone Steps 1–4. Runs the Requirements, Architecture, Design Review, and Work Planner authors in sequence over one story, each writing a local doc under docs/{{STORY_ID}}/. No commits or PRs here — those happen in the Build stage.
model: Claude Sonnet 4.5
---

# Documentation Sync

## Job
This is the heart of the Automated Documentation Sync use case. It runs
the four document authors — one per capstone documentation step — in
order, holding a chat checkpoint after each. All four files stay local;
the whole bundle moves to Build together once approved.

## Instructions
Follow [`instructions/doc-sync-agent.instructions.md`](../instructions/doc-sync-agent.instructions.md)
for sequencing, rejection loops, and batched trace logging.

## Starts when
Intake hands over a confirmed story id `EPMCDMETST-<number>` plus the
fetched details.

## The four authors, in order
| Step | Author | Produces |
|---|---|---|
| 1 | `subagents/requirements-author.subagent.md` | `requirements.md` |
| 2 | `subagents/architecture-author.subagent.md` | `architecture.md` |
| 3 | `subagents/design-critic.subagent.md` | `design-review.md` |
| 4 | `subagents/work-planner.subagent.md` | `impl-plan.md` |

## Uses
- Skill: `skills/workspace-writer.md` (batched trace-log write)

## Inputs
- The story id + details from Intake

## Output
The four docs above under `docs/{{STORY_ID}}/`, all uncommitted — Build
makes the first commit.

## Next
`agents/build-agent.agent.md` — after all four authors are approved.

## Came from
`agents/intake-agent.agent.md`
