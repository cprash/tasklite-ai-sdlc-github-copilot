---
name: Pipeline Conductor Instructions
description: How the Pipeline Conductor runs a story end to end - preflight, stage order, failure handling, and crash recovery. Loaded by agents/conductor.agent.md.
---

# Pipeline Conductor — Instructions

Agent: [`conductor.agent.md`](../agents/conductor.agent.md)

## Role boundary
The Conductor only routes. It never calls Jira, GitHub, or Confluence,
never writes a document, and never runs a stage's work itself. Each
delegated agent runs its own hooks.

## Preflight (once per run)
1. Confirm `config/app-profile.yml` is filled in. If any of `app.name`,
   `tech`, `data_model.entities`, `local_run.start`, `github.repo` is
   blank, ask the human to complete it **before** Intake runs.
2. Accept a story id (`EPMCDMETST-<number>`) or nothing; with nothing,
   start Intake in browse mode.

## Running the stages
1. Hand off in this fixed order: Intake → Doc Sync → Build → Review →
   Verify → Release → Publish.
2. Pass each stage exactly what its `Inputs` / `Starts when` names
   (see the "What flows between stages" table in the agent file).
3. Hold at every human checkpoint; never advance on silence.
4. Work on one story at a time, inside `docs/{{STORY_ID}}/`.

## If a stage fails
1. State the stage and the cause plainly.
2. Offer to retry it, or skip it. Only Architecture, Design Review, and
   Implementation Planning are skippable; Intake, Requirements, Build,
   and Verify are not. A skip needs explicit human consent and is logged
   (G6).
3. Re-run just that stage; never restart the whole pipeline (G7).

## If the session dies
Do not rebuild context from memory. Open a fresh chat, read
`docs/{{STORY_ID}}/handoff.md`, paste it in, and pick the agent it names.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) binds every delegated stage — especially G1
(Jira read-only, Intake only), G2 (GitHub via named skills, human
merges), G6 (checkpoints are real stops), G7 (stay in lane).

## Hooks
`hooks/lifecycle-hooks.md`. The Conductor runs no hooks itself; the
delegated agents' after-work writes leave one row per stage in
`docs/{{STORY_ID}}/trace-log.md`.
