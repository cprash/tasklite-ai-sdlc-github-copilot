import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runDocsSync } from "../docs-sync.mjs";

function makeFixtureRepo() {
  const root = mkdtempSync(path.join(tmpdir(), "docs-sync-test-"));
  const srcDir = path.join(root, "backend", "src");
  mkdirSync(path.join(srcDir, "routes"), { recursive: true });
  mkdirSync(path.join(srcDir, "controllers"), { recursive: true });
  mkdirSync(path.join(srcDir, "validators"), { recursive: true });
  mkdirSync(path.join(root, "docs"), { recursive: true });

  writeFileSync(
    path.join(srcDir, "app.ts"),
    `
import express from "express";
import { tasksRouter } from "./routes/tasks.routes.js";
export function createApp() {
  const app = express();
  app.use("/api", tasksRouter);
  return app;
}
`
  );

  writeFileSync(
    path.join(srcDir, "routes", "tasks.routes.ts"),
    `
import { Router } from "express";
import { listTasks, createTask } from "../controllers/tasks.controller.js";
export const tasksRouter = Router();
tasksRouter.get("/tasks", listTasks);
tasksRouter.post("/tasks", createTask);
`
  );

  writeFileSync(
    path.join(srcDir, "controllers", "tasks.controller.ts"),
    `
// List all tasks, newest first.
export async function listTasks(_req, res, next) {
  try {
    res.json(await prisma.task.findMany());
  } catch (error) {
    next(error);
  }
}

// Create a task with a required title.
export async function createTask(req, res, next) {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "title is required");
    }
    res.status(201).json(parsed.data);
  } catch (error) {
    next(error);
  }
}
`
  );

  writeFileSync(
    path.join(srcDir, "validators", "task.validators.ts"),
    `
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
});
`
  );

  writeFileSync(
    path.join(root, "README.md"),
    `# Fixture

## API endpoint summary

<!-- docs-sync:api-table:start -->
<!-- docs-sync:api-table:end -->
`
  );

  return root;
}

test("runDocsSync: happy path generates API.md, patches README, and writes an initial changelog entry", () => {
  const root = makeFixtureRepo();
  try {
    const result = runDocsSync({ cwd: root });

    assert.equal(result.endpoints.length, 2);
    assert.deepEqual(result.changed, { apiDoc: true, readme: true, changelog: true });
    assert.deepEqual(result.warnings, []);

    const apiDoc = readFileSync(path.join(root, "docs", "API.md"), "utf8");
    assert.match(apiDoc, /## GET \/api\/tasks/);
    assert.match(apiDoc, /## POST \/api\/tasks/);
    assert.match(apiDoc, /\| `title` \| string \| yes \| min length 1 \|/);

    const readme = readFileSync(path.join(root, "README.md"), "utf8");
    assert.match(readme, /\| GET \| `\/api\/tasks` \| List all tasks, newest first\. \|/);

    const changelog = readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
    assert.match(changelog, /Initial automated documentation baseline \(2 endpoints\)\./);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runDocsSync: second run with no source changes is idempotent", () => {
  const root = makeFixtureRepo();
  try {
    runDocsSync({ cwd: root });
    const second = runDocsSync({ cwd: root });
    assert.deepEqual(second.changed, { apiDoc: false, readme: false, changelog: false });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
