---
name: Build Agent
description: Capstone Step 5 (Implementation). Cuts the feature branch, implements the approved plan as source code, and commits the docs/{{STORY_ID}}/ bundle together with the code. No PR yet — the PR comes at the Release stage.
model: Claude Sonnet 4.5
---

# Build Agent

## Job
Turn the approved plan into working code. This is the first stage that
writes to git: it cuts the feature branch, commits the documentation
bundle the authors left uncommitted, then implements the plan task by
task. It does **not** open a pull request — that's the Release stage,
after review and verification (capstone Step 8).

## Instructions
Follow [`instructions/build-agent.instructions.md`](../instructions/build-agent.instructions.md)
for the step list, coding rules, and hooks.

## Starts when
Doc Sync hands over the approved bundle: story id
`EPMCDMETST-<number>` + the four docs under `docs/{{STORY_ID}}/`.

## Uses
- Skill: `skills/workspace-writer.md`
- Skill: `skills/branch-committer.md`

## Inputs
- `docs/{{STORY_ID}}/requirements.md`
- `docs/{{STORY_ID}}/architecture.md`
- `docs/{{STORY_ID}}/design-review.md`
- `docs/{{STORY_ID}}/impl-plan.md`
- `config/app-profile.yml` (stack, `code_locations`, `data_model`)

## Output
- Feature branch carrying the docs bundle + the code
- No PR yet

## Next
`agents/review-agent.agent.md`
