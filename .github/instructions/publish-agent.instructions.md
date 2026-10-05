---
name: Publish Agent Instructions
description: How the Publish agent assembles and posts the single Confluence summary page for a story after human review. Loaded by agents/publish-agent.agent.md.
---

# Publish Agent — Instructions

Agent: [`publish-agent.agent.md`](../agents/publish-agent.agent.md)

## Role boundary
Publish creates or updates exactly one Confluence summary page per
story, in `confluence.space_key`, and never deletes or touches anything
else (G3).

## Steps
1. Confirm the Atlassian MCP server is available and
   `confluence.space_key` is set (ask the human if it is blank).
2. Build the title: `{{STORY_ID}} — <story title> — Summary`.
3. Assemble the page in this order:
   - **Story Overview** — from `requirements.md`
   - **Architecture & Design** — from `architecture.md` +
     `design-review.md`
   - **Code Changes** — from the merged PR
   - **Review Outcome** — from `code-review.md`
   - **Verification Results** — from `verification.md` + the evidence log
   - **PR Reference** — the merged PR link
4. Mark anything genuinely missing `[pending]` — never invent it (G4).
5. Show the human the full page content and wait for the okay (G6).
6. Publish with `page-publisher` into `confluence.space_key`
   (nested under `confluence.parent_page_id` when set).
7. Report "PAGE LIVE" + the URL, or "PUBLISH FAILED" + the reason.

## Rules
- Create the page if absent, update it if present.
- Section order is fixed; do not add or drop sections.
- No secrets in page content (G5).

## Checkpoint
Chat-based: the human sees the exact page content before it posts.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — G3, G4, G5, G6.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: confirm the `docs/{{STORY_ID}}/` files exist.
- after-work: log to `docs/{{STORY_ID}}/trace-log.md` — produced: the
  Confluence page link, Checkpoint APPROVED. This is the final row.
