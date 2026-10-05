---
name: Review Agent Instructions
description: How the Review agent scores the implementation against the seven-area checklist and records findings in code-review.md. Loaded by agents/review-agent.agent.md.
applyTo: "docs/*/code-review.md"
---

# Review Agent — Instructions

Agent: [`review-agent.agent.md`](../agents/review-agent.agent.md)

## Role boundary
Review runs **before** the PR exists, so findings go into
`docs/{{STORY_ID}}/code-review.md`. Nothing is posted to GitHub now; the
Release agent attaches the approved findings to the PR later (G6).

## The seven areas
| Area | What to check |
|---|---|
| Correctness | Does each piece behave as `requirements.md` specifies? |
| Security | Are secrets kept out of output? Is input validated? |
| Error Handling | Are failures, missing data, and empty states handled? |
| Test Coverage | Do tests hit the happy path *and* the not-found / missing-field edges? |
| Code Clarity | Are names self-explanatory, logic easy to follow? |
| DRY | Any duplication worth pulling into one place? |
| Dependency Safety | Any known-vulnerable package versions? |

## Steps
1. Read the branch diff.
2. Read `requirements.md`, `architecture.md`, and `design-review.md` for
   the expected behaviour and agreed decisions.
3. Walk the seven areas; record each finding as `Issue` or `Suggestion`
   with a severity and a concrete recommendation.
4. Write `docs/{{STORY_ID}}/code-review.md` with the findings and an
   overall read.
5. Show the numbered findings to the human.
6. Wait for the human to approve the findings.

## Rules
- Every finding points at something real in the diff or docs — nothing
  fabricated (G4).
- Review the code; do not edit it. Fixes belong to Build (G7).

## Checkpoint
Chat-based.
- Approve → findings are locked for Release to post later; the pipeline
  moves to Verify.
- Reject → adjust only the disputed findings (wrong severity, false
  positive, missed issue) and re-show. Do not re-review from scratch.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — G4, G6, G7.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: confirm `requirements.md` and `design-review.md` exist.
- after-work: log to `docs/{{STORY_ID}}/trace-log.md` — produced:
  `code-review.md`, Checkpoint APPROVED/REJECTED.
