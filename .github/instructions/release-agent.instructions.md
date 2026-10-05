---
name: Release Agent Instructions
description: How the Release agent drafts the five-section PR body and CHANGELOG entry, opens the PR, posts approved review findings, and hands merge to the human. Loaded by agents/release-agent.agent.md.
applyTo: "CHANGELOG.md"
---

# Release Agent — Instructions

Agent: [`release-agent.agent.md`](../agents/release-agent.agent.md)

## Role boundary
Release opens the PR (capstone Step 8) only after review and
verification. Nothing posts before the human has seen the exact content
(G6), and no agent merges (G2).

## Steps
1. Draft the PR body with all five required sections:
   - **Summary** — 2–3 sentences on what shipped and why
   - **Changes Made** — files added/changed, each with a reason (the
     `docs/{{STORY_ID}}/` bundle + code + tests)
   - **Test Evidence** — the reported counts + the evidence log path
   - **Known Limitations** — out-of-scope and any `[pending]` items
   - **Reviewer Checklist** — a tick-list for the human reviewer
2. Add a `CHANGELOG.md` entry: story id, date, a one-line summary, and
   the PR link placeholder.
3. Show the human the full PR body and the CHANGELOG entry; wait for the
   okay. **(checkpoint 1)**
4. Commit `CHANGELOG.md` with `branch-committer`.
5. Open the PR with `pull-request-opener`, title
   `{{STORY_ID}}: <story title>`.
6. Post the approved `code-review.md` findings onto the PR with
   `review-poster`.
7. Tell the human the PR is open and ask them to review and **merge it
   themselves**. **(checkpoint 2)**
8. On merge confirmation, produce a short wrap-up (merged PR link, files
   changed) for the Publish agent.

## Rules
- All five PR sections are mandatory; a missing one blocks the PR.
- No secrets in the PR body or changelog (G5).
- Anything genuinely unknown is `[pending]`, never invented (G4).
- Never merge, never push to `github.base_branch` (G2).

## Checkpoint
Twice: the human okays the PR body + CHANGELOG before anything posts;
the human merges the PR manually and confirms.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — G2, G4, G5, G6.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: confirm `code-review.md` and `verification.md` exist.
- after-work: log two rows (PR opened; merge confirmed) in one write to
  `docs/{{STORY_ID}}/trace-log.md`.
