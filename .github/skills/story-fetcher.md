# Skill — story-fetcher

**What it does:** pulls a user story to work on, from whichever source
holds it — Jira, a Confluence page, or a Word document. Read-only.

**Who uses it:** the Intake agent (`agents/intake-agent.agent.md`) only.

## How it connects
Jira is reached through the **`jira-epam` MCP server** (read-only mode)
and Confluence through the **Atlassian MCP server**. Each server owns
its credentials — this skill never reads a token. A Word document is
read from a local path the human supplies. (Raw REST using the `.env`
fallback variables is a last resort, not the norm.)

## Before it runs
- For a Jira source, confirm the `jira-epam` MCP server is available;
  for a Confluence source, confirm the Atlassian MCP server. If the
  needed one is missing, stop and ask the human to start it.
- For a single Jira story, check the id matches `EPMCDMETST-<number>`.
- For a Word doc, confirm the file path exists.

## Three ways to call it

### Browse the backlog (Jira)
No input. Ask the `jira-epam` "search" tool with JQL:
`project = EPMCDMETST AND statusCategory != Done AND issuetype = Story ORDER BY rank ASC`.
Only Story-type issues come back (no sub-tasks, tasks, or bugs). Group
by parent/epic and return a numbered list for the human to pick from.
Strictly read-only.

### Pull one Jira story
Input: `EPMCDMETST-<number>`. Ask the `jira-epam` "get issue" tool
and return: title, description, acceptance criteria, estimate, status,
owner.

### Read a story from Confluence or Word
Input: a Confluence page (title or id) or a local `.docx` path. Extract
the same fields — title, description, acceptance criteria — mapping
them from the document's headings. Note anything the document does not
provide as `[pending]` rather than inventing it.

## What comes back
- Backlog browse: a numbered list of `{ epic, story_id, title, status }`
- Single story (any source): `{ story_id, title, description,
  acceptance_criteria, estimate, status, owner, source }`

## When it goes wrong
- MCP server missing → "Start the `jira-epam` (Jira) or `atlassian`
  (Confluence) MCP server and retry."
- Story not found → "Can't find {{STORY_ID}} in EPMCDMETST."
- No read access → "The Atlassian connection can't read EPMCDMETST."
- Empty backlog → "No open stories in EPMCDMETST right now."
- Word file missing → "No document at that path."
- Never attempt a write of any kind — G1 forbids it.
