import { splitTopLevelArgs } from "./util.mjs";

// Parses `export const xSchema = z.object({ ... })` blocks into a field list.
export function extractValidators(sourceText) {
  const validators = [];
  const objectRe = /export const (\w+)\s*=\s*z\.object\(\{([\s\S]*?)\}\)/g;
  let m;
  while ((m = objectRe.exec(sourceText))) {
    const name = m[1];
    const fields = splitTopLevelArgs(m[2]).map(parseField).filter(Boolean);
    validators.push({ name, fields });
  }
  return validators;
}

function parseField(entry) {
  const fieldMatch = entry.match(/^(\w+)\s*:\s*z\.(\w+)\(([\s\S]*)$/);
  if (!fieldMatch) return null;
  const [, name, baseType, rest] = fieldMatch;

  // rest = "<baseArgs>)<chained modifiers>" — find the paren that closes the base type call.
  let depth = 1;
  let i = 0;
  for (; i < rest.length; i++) {
    if (rest[i] === "(") depth++;
    else if (rest[i] === ")") {
      depth--;
      if (depth === 0) break;
    }
  }
  const baseArgs = rest.slice(0, i);
  const chain = rest.slice(i + 1);

  const modifiers = [...chain.matchAll(/\.([a-zA-Z]+)\(([^)]*)\)/g)].map((mm) => ({ name: mm[1], args: mm[2] }));
  const required = !modifiers.some((mod) => mod.name === "optional");

  const constraints = [];
  if (baseType === "enum") {
    const values = [...baseArgs.matchAll(/["'`]([^"'`]+)["'`]/g)].map((mm) => mm[1]);
    constraints.push(`one of: ${values.join(", ")}`);
  }
  for (const mod of modifiers) {
    if (mod.name === "min") constraints.push(`min length ${mod.args.split(",")[0].trim()}`);
    if (mod.name === "max") constraints.push(`max length ${mod.args.split(",")[0].trim()}`);
  }

  return { name, type: baseType, required, constraints };
}
