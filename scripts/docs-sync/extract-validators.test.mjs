import { test } from "node:test";
import assert from "node:assert/strict";
import { extractValidators } from "./extract-validators.mjs";

test("extractValidators: required string field with min-length constraint", () => {
  const source = `
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
});
`;
  const [schema] = extractValidators(source);
  assert.equal(schema.name, "createTaskSchema");
  assert.deepEqual(schema.fields, [
    { name: "title", type: "string", required: true, constraints: ["min length 1"] },
  ]);
});

test("extractValidators: enum field reports its allowed values", () => {
  const source = `
export const updateTaskStatusSchema = z.object({
  status: z.enum(["OPEN", "COMPLETED"]),
});
`;
  const [schema] = extractValidators(source);
  assert.equal(schema.fields[0].type, "enum");
  assert.equal(schema.fields[0].required, true);
  assert.deepEqual(schema.fields[0].constraints, ["one of: OPEN, COMPLETED"]);
});

test("extractValidators: optional() modifier marks a field as not required", () => {
  const source = `
export const exampleSchema = z.object({
  note: z.string().optional(),
});
`;
  const [schema] = extractValidators(source);
  assert.equal(schema.fields[0].required, false);
});
