---
name: Story Intake Instructions
description: How the Intake agent reads a story from Jira (read-only), Confluence, or Word in browse, single-story, and document modes. Loaded by agents/intake-agent.agent.md.
---

# Story Intake — Instructions

Agent: [`intake-agent.agent.md`](../agents/intake-agent.agent.md)

## Role boundary
Intake reads; it writes no requirements (that is the Requirements
Author's work) and never writes to Jira. It is the only agent allowed to
reach Jira at all (G1).

## Browse mode (no story chosen)
1. Load `story-fetcher`; confirm the `jira-epam` MCP server is available.
2. Pull the open `EPMCDMETST` stories — Story type only, no sub-tasks,
   tasks, or bugs.
3. Show a numbered list grouped by epic (id, title, status).
4. Ask which story to take.
5. Continue into single-story mode with that id.

## Single-story mode (Jira)
1. Check the id matches `EPMCDMETST-<number>`.
2. Load `story-fetcher`; confirm the `jira-epam` MCP server.
3. Pull: title, description, acceptance criteria, estimate, status,
   owner.
4. Show the full details to the human.
5. Hand the id + details to Doc Sync.

## Document mode (Confluence or Word)
1. Load `story-fetcher`. For Confluence confirm the `atlassian` MCP
   server; for Word confirm the file path.
2. Map the document to the same fields. Mark anything it does not
   provide as `[pending]` (G4).
3. Confirm with the human which Jira id to associate (still
   `EPMCDMETST-<number>`) — downstream paths depend on it.
4. Show the details, then hand off to Doc Sync.

## Rules
- Jira: no create, update, transition, comment, or delete — even if
  asked (G1). If the human wants a status change, tell them to make it
  themselves.
- Never invent a story field; unknown means `[pending]`.

## Checkpoint
None of its own — flows straight into Doc Sync once a story is locked
in.

## Guardrails
[`rules/guardrails.md`](../rules/guardrails.md) — especially G1 and G4.

## Hooks
`hooks/lifecycle-hooks.md`.
- before-work: no file inputs in any mode — skip the disk check.
- after-work: once a story id is fixed, log to
  `docs/{{STORY_ID}}/trace-log.md` with Checkpoint `N/A`. Skip both hooks
  in browse mode until a story is chosen.
