import { test } from "node:test";
import assert from "node:assert/strict";
import { extractControllerInfo } from "./extract-controllers.mjs";

test("extractControllerInfo: uses the leading comment as the description", () => {
  const source = `
// List all tasks, newest first.
export async function listTasks(_req, res, next) {
  try {
    res.json(await prisma.task.findMany());
  } catch (error) {
    next(error);
  }
}
`;
  const info = extractControllerInfo(source, "listTasks", [], () => {});
  assert.equal(info.description, "List all tasks, newest first.");
  assert.deepEqual(info.responses, [{ status: 200, meaning: "OK" }]);
});

test("extractControllerInfo: falls back and warns when there is no leading comment", () => {
  const source = `
export async function deleteTask(req, res, next) {
  try {
    await prisma.task.delete({ where: { id: 1 } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
`;
  const warnings = [];
  const info = extractControllerInfo(source, "deleteTask", [], (msg) => warnings.push(msg));
  assert.equal(info.description, "No description provided.");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /no leading/);
});

test("extractControllerInfo: detects the validator schema used for the request body", () => {
  const source = `
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
`;
  const info = extractControllerInfo(source, "createTask", ["createTaskSchema", "updateTaskStatusSchema"], () => {});
  assert.equal(info.requestSchemaName, "createTaskSchema");
  assert.deepEqual(info.responses, [
    { status: 201, meaning: "Created" },
    { status: 400, meaning: "title is required" },
  ]);
});

test("extractControllerInfo: returns null when the handler doesn't exist in the file", () => {
  const info = extractControllerInfo("export async function other() {}", "missingHandler", [], () => {});
  assert.equal(info, null);
});

test("extractControllerInfo: a bare res.json() alongside thrown HttpErrors still reports the implicit 200", () => {
  const source = `
// Update a task's title.
export async function updateTaskTitle(req, res, next) {
  try {
    const parsed = updateTaskTitleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "title is required");
    }
    const task = await prisma.task.update({ where: { id: 1 }, data: { title: parsed.data.title } });
    res.json(task);
  } catch (error) {
    next(error);
  }
}
`;
  const info = extractControllerInfo(source, "updateTaskTitle", ["updateTaskTitleSchema"], () => {});
  assert.deepEqual(info.responses, [
    { status: 200, meaning: "OK" },
    { status: 400, meaning: "title is required" },
  ]);
});
