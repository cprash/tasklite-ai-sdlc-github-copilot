---
name: Story Intake
description: Pipeline entry point. Reads a user story from Jira (EPMCDMETST), a Confluence page, or a Word document via the jira-epam (Jira, read-only) and Atlassian (Confluence) MCP servers, then hands it to Doc Sync. Never writes to Jira.
model: Claude Sonnet 4.5
---

# Story Intake

## Job
Get the pipeline a story to work on. Capstone Step 1 allows the story to
come from Jira, Confluence, or a Word document — this agent handles all
three and normalises them to the same set of fields before handing off.
It writes no requirements itself; that's the Requirements Author's work.

## Instructions
Follow [`instructions/intake-agent.instructions.md`](../instructions/intake-agent.instructions.md)
for the browse, single-story, and document modes.

## Starts when
- The human asks to see the backlog, or gives no story id (browse mode)
- The human gives a story id `EPMCDMETST-<number>` (single-story mode)
- The human points at a Confluence page or a local `.docx` (document
  mode)

## Uses
- Skill: `skills/story-fetcher.md`
- Skill: `skills/workspace-writer.md` (trace log only)

## Inputs
- Nothing (browse), a story id, a Confluence reference, or a Word path

## Output
- Browse: a numbered backlog list
- Single-story / document: the full story details for one
  `EPMCDMETST-<number>`
- Nothing written to Jira — reads only (G1)

## Hands off to
`agents/doc-sync-agent.agent.md`
