---
description: "Generate a PR description (summary, changes made, test evidence, known limitations, reviewer checklist) for the current branch's changes."
agent: "agent"
---
Prepare a pull request description for the changes on the current branch, following TaskLite's Agentic SDLC (see [docs/requirements.md](../../docs/requirements.md), [docs/impl-plan.md](../../docs/impl-plan.md)).

Include exactly these sections:

- **Summary** — 2-3 sentences on what was built and why.
- **Changes Made** — bulleted list of files added/modified and the reason for each.
- **Test Evidence** — the actual test run output (run `npm test` in the relevant package(s) and paste the result).
- **Known Limitations** — anything explicitly out of scope or marked "Not Found".
- **Reviewer Checklist** — a tick-list covering: correctness against `docs/requirements.md`, security (no secrets, input validated), error handling, test coverage (happy path + edge cases), code clarity, DRY, and dependency safety.

Base the diff on `git diff main...HEAD` (or the current branch vs. its upstream). Do not fabricate test output — run the tests first.
