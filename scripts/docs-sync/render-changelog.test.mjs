import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, diffSnapshots, renderChangelogEntry, patchChangelog } from "./render-changelog.mjs";

const endpoint = (overrides = {}) => ({
  method: "GET",
  path: "/api/tasks",
  description: "List all tasks, newest first.",
  requestSchema: null,
  responses: [{ status: 200, meaning: "OK" }],
  ...overrides,
});

test("diffSnapshots: first run reports every endpoint as the initial baseline", () => {
  const curr = buildSnapshot([endpoint()]);
  const diff = diffSnapshots(null, curr);
  assert.equal(diff.isFirstRun, true);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.added.length, 1);
});

test("diffSnapshots: identical snapshots report no changes (idempotent second run)", () => {
  const curr = buildSnapshot([endpoint()]);
  const diff = diffSnapshots(curr, curr);
  assert.equal(diff.hasChanges, false);
  assert.deepEqual(diff.added, []);
  assert.deepEqual(diff.removed, []);
  assert.deepEqual(diff.changed, []);
});

test("diffSnapshots: detects added, removed, and changed endpoints", () => {
  const prev = buildSnapshot([endpoint(), endpoint({ method: "DELETE", path: "/api/tasks/:id", description: "Delete a task." })]);
  const curr = buildSnapshot([
    endpoint({ description: "List all tasks (updated)." }),
    endpoint({ method: "POST", path: "/api/tasks", description: "Create a task." }),
  ]);
  const diff = diffSnapshots(prev, curr);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.changed.length, 1);
});

test("patchChangelog: inserts the entry right after the [Unreleased] heading", () => {
  const before = "# Changelog\n\n## [Unreleased]\n";
  const entry = renderChangelogEntry({ isFirstRun: true, added: [endpoint()] }, "2026-09-30");
  const after = patchChangelog(before, entry);
  assert.match(after, /## \[Unreleased\]\n\n### 2026-09-30 — Documentation sync/);
  assert.match(after, /Initial automated documentation baseline \(1 endpoint\)\./);
});
