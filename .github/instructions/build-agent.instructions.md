---
name: Build Agent Instructions
description: How the Build agent cuts the feature branch, commits the docs bundle, and implements the approved plan task by task. Loaded by agents/build-agent.agent.md.
---

# Build Agent — Instructions

Agent: [`build-agent.agent.md`](../agents/build-agent.agent.md)

## Role boundary
Build is the first stage that writes to git. It implements only what the
approved `impl-plan.md` covers and does **not** open a pull request —
that is the Release stage (G2, G7).

## Steps
1. Confirm all four docs exist under `docs/{{STORY_ID}}/`.
2. Cut the feature branch and make the first commit — the whole
   `docs/{{STORY_ID}}/` bundle — via `branch-committer`.
3. Read `impl-plan.md` and list the tasks in dependency order.
4. For each task, in order:
   a. Pull the relevant contracts and decisions from `architecture.md`
      and `design-review.md`.
   b. Write code into the folders in `code_locations`, on the declared
      stack.
   c. Follow the coding notes in `copilot-instructions.md`.
   d. Give every function real error handling.
   e. Read secrets from the environment — never hardcode (G5).
   f. Save files with `workspace-writer`.
   g. Commit after the task with `branch-committer`.
   h. Report the task as done.
5. Summarise every file created (docs + code).
6. Tell the human the branch is ready for Review — no PR is opened here.

## Coding rules
- Secrets from the environment only (G5).
- Error handling in every function.
- Only the entities in `data_model.entities` — invent nothing (G4).
- Build only what the approved plan covers; no side quests (G7).
- Feature branch only; never push to `github.base_branch`, never merge
  (G2).

## Checkpoint
None of its own — flows into Review.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — G2, G4, G5, G7.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: confirm all four `docs/{{STORY_ID}}/` files exist.
- after-work: log to `docs/{{STORY_ID}}/trace-log.md` — produced: the
  feature branch + commits, Checkpoint `N/A`.
