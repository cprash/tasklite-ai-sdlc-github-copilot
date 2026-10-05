---
name: Verify Agent Instructions
description: How the Verify agent gets the app running, generates and records unit + integration tests, and checks document quality. Loaded by agents/verify-agent.agent.md.
applyTo: "docs/*/verification.md"
---

# Verify Agent — Instructions

Agent: [`verify-agent.agent.md`](../agents/verify-agent.agent.md)

## Role boundary
Verification covers the **code** (unit + integration tests) and the
**documents** (content quality). The agent generates tests and records
results; the human runs them and reports the counts. Results are never
faked (G4).

## Part A — get it running
1. Ask the human to pull the latest feature branch.
2. Walk them through `local_run.install`, then `local_run.build` (if
   set), then `local_run.start`, so the app is reachable at
   `local_run.url`.
3. If `local_run.health_check` is set, suggest using it to confirm the
   app is up.
4. Wait for "running".

## Part B — code verification
5. Build a traceability list first: one line per Functional Requirement
   and per Acceptance Criterion, each mapped to the test that will cover
   it. A requirement with no test is a gap — call it out.
6. Show the list and confirm the scope to automate. **(checkpoint 1)**
7. Generate unit + integration tests with `quality.test_tool`, under
   `quality.tests_path` (e.g. `tests/{{STORY_ID}}.spec.ts`), matching the
   traceability list. Base assertions on the approved contracts in
   `architecture.md`, not on reading app source; mark anything
   unverifiable with `// TODO: confirm against the running app`.
8. Commit the tests with `branch-committer`.
9. Ask the human to run them against `local_run.url` and report
   "DONE. X passed, Y failed". **(checkpoint 2)**
10. Record the result with `evidence-logger` under
    `quality.evidence_path`.

## Part C — document verification
11. Read the four synced docs and check: every section filled, no stray
    `[pending]`, requirements ↔ architecture ↔ plan consistent, nothing
    outside `data_model.entities`.
12. Note any doc issues so the authors can patch them before Release.

## Rules
- Pass/fail counts come only from the human (G4).
- Tests are committed to the feature branch; no direct push to base, no
  merge (G2).
- If `quality.test_tool` is blank, ask the human which tool to use —
  do not pick one silently.

## Checkpoint
Twice: confirm the test scope before generating; wait for the human's
pass/fail report before moving on. If failures remain, ask whether to
push to Release anyway or fix and re-run first.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — G2, G4.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: confirm `requirements.md` exists and `local_run.*` is
  set.
- after-work: log two rows (tests committed; verification recorded) in
  one write to `docs/{{STORY_ID}}/trace-log.md`.
