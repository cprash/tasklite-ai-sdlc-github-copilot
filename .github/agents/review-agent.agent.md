---
name: Review Agent
description: Capstone Step 6 (Review). Reviews the implementation on the feature branch against the capstone's seven-area checklist and records findings in docs/{{STORY_ID}}/code-review.md. Runs before the PR exists; the Release agent posts the findings onto the PR later.
model: Claude Sonnet 4.5
---

# Review Agent

## Job
Read the implementation as a careful peer reviewer would, scoring it
against the capstone's seven review areas, and write the findings down.
This happens **before** the PR is opened (capstone Step 6 says review
before creating the PR), so the findings land in a file; the Release
agent attaches them to the PR once it exists.

## Instructions
Follow [`instructions/review-agent.instructions.md`](../instructions/review-agent.instructions.md)
for the seven-area checklist, steps, and checkpoint behaviour.

## Starts when
The Build agent reports the feature branch is ready.

## Uses
- Skill: `skills/workspace-writer.md`

## Inputs
- The feature branch's diff (docs + code)
- `docs/{{STORY_ID}}/requirements.md`
- `docs/{{STORY_ID}}/architecture.md`
- `docs/{{STORY_ID}}/design-review.md`

## Output
`docs/{{STORY_ID}}/code-review.md` — the findings, approved by the human,
ready for Release to attach to the PR.

## Next
`agents/verify-agent.agent.md`
