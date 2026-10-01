# Copilot Instructions

This repository hosts an **Agentic SDLC Pipeline** for the *Automated
Documentation Sync* capstone. The whole software delivery lifecycle —
from capturing a user story through to merging a production-ready pull
request — is driven by GitHub Copilot: a conductor agent, eight stage
agents, four documentation authoring sub-agents, reusable skills,
shared guardrails, and lifecycle hooks.

Two principles shape everything here:

1. **Portable, not project-bound.** The pipeline must run against *any*
   codebase. It never opens, scans, or infers the target application's
   source. Everything it needs to know about the app it reads from one
   human-maintained descriptor: [`config/app-profile.yml`](config/app-profile.yml).
   When a needed fact is absent from that file and from the story, the
   agent asks a question — it does not guess.
2. **Human stays in the loop.** Every stage that produces an artifact
   pauses for an explicit approval before the pipeline advances.

## How the pieces map to the capstone's 8 steps
| Capstone step | Owned by |
| --- | --- |
| 1 Requirements | `subagents/requirements-author.subagent.md` |
| 2 Architecture | `subagents/architecture-author.subagent.md` |
| 3 Design Review | `subagents/design-critic.subagent.md` |
| 4 Implementation Planning | `subagents/work-planner.subagent.md` |
| 5 Implementation | `agents/build-agent.agent.md` |
| 6 Review | `agents/review-agent.agent.md` |
| 7 Verify | `agents/verify-agent.agent.md` |
| 8 PR | `agents/release-agent.agent.md` |

Story intake (reading the user story) is handled by
`agents/intake-agent.agent.md`, and the final documentation sync to
Confluence by `agents/publish-agent.agent.md`. The whole run is
coordinated by `agents/conductor.agent.md`.

## Directory layout
- `agents/` — picker-selectable stage agents plus the conductor
- `subagents/` — the four documentation authors invoked by Doc Sync
- `skills/` — single-purpose, reusable actions (fetch, write, commit, PR,
  comment, publish, log evidence)
- `templates/` — the exact shape each generated document must take
- `rules/` — the shared guardrail set every agent obeys
- `hooks/` — the start/finish lifecycle steps every agent runs
- `config/` — the per-repo app descriptor and the pipeline settings
- `prompts/` — one-command entry points
- `docs/<STORY_ID>/` — a dedicated folder per story, named after its
  story id (e.g. `docs/EPM-CDME-TEST-42/`), holding every generated
  artifact for that story: `requirements.md`, `architecture.md`,
  `design-review.md`, `impl-plan.md`, then `code-review.md`,
  `verification.md`, `trace-log.md`, and `handoff.md`. Nothing is ever
  written loose in `docs/` — always inside the story's own folder.

## External systems
- **Jira** (project `EPM-CDME-TEST`) and **Confluence** are reached only
  through the **Atlassian MCP server**.
- **GitHub** (branches, commits, pull requests, comments) is reached only
  through the **GitHub MCP server**.
- These servers hold their own credentials. Agent logic never handles
  Jira / Confluence / GitHub tokens.

## Writing code for the target app
- Honour the languages and frameworks listed in `app-profile.yml`; do not
  bring in a different stack unprompted.
- Give functions clear names and wrap them in real error handling.
- Keep each change inside the scope the approved plan defines.

## Secrets
- Credentials are never written into code or docs — they come from the
  environment or the relevant MCP server.
- `.env` is off-limits: never read into context, never written, never
  committed.

## Non-negotiables
- Ask before assuming.
- Wait for approval at every checkpoint.
- The only data entities that exist are those under
  `data_model.entities` in `app-profile.yml` — never invent more.
- Jira access is **read-only**, and only the intake agent may touch it.
  See `rules/guardrails.md` G1.

## Where to look
- Run control: `agents/conductor.agent.md`
- App facts: `config/app-profile.yml`
- Settings: `config/pipeline-settings.md`
- Guardrails: `rules/guardrails.md`
- Lifecycle hooks: `hooks/lifecycle-hooks.md`
- Environment: `.env.example`
