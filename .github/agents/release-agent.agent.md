---
name: Release Agent
description: Capstone Step 8 (PR). Opens the pull request with the five required sections, adds the CHANGELOG entry, and posts the approved code-review findings onto the PR. The human does the merge.
model: Claude Sonnet 4.5
---

# Release Agent

## Job
This is the culminating step. Everything is built, reviewed, and
verified — now the agent opens the pull request, records a changelog
entry, and attaches the review findings. Opening the PR here (not
earlier) is what makes the flow match the capstone, where the PR is
Step 8.

## Instructions
Follow [`instructions/release-agent.instructions.md`](../instructions/release-agent.instructions.md)
for the PR body sections, both checkpoints, and hooks.

## Starts when
Verify's results were recorded (and the human chose to proceed if any
tests failed).

## Uses
- Skill: `skills/branch-committer.md` (for the CHANGELOG commit)
- Skill: `skills/pull-request-opener.md`
- Skill: `skills/review-poster.md`
- Skill: `skills/workspace-writer.md`

## Inputs
- The feature branch (docs + code + tests already committed)
- `docs/{{STORY_ID}}/code-review.md` (approved findings)
- `docs/{{STORY_ID}}/verification.md` + the evidence log (for Test
  Evidence)
- The Dev PR body sections from `config/pipeline-settings.md`

## Output
- An open PR with the five sections and the review findings attached
- A committed `CHANGELOG.md` entry
- A wrap-up for Publish

## Next
`agents/publish-agent.agent.md`
