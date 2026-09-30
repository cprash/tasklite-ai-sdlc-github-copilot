import { splitTopLevelArgs, extractBalanced, extractResponses, findLeadingComment } from "./util.mjs";

const METHODS = ["get", "post", "put", "patch", "delete"];

// Parses one *.routes.ts file's `<router>.<method>("path", handler)` calls.
// Expects one route registration per statement (named handler or inline arrow function) — this is the shape
// docs-sync understands; keep new routes in this form so they stay parseable.
export function extractRoutesFromFile(sourceText, mounts, fileName, warn = () => {}) {
  const routerMatch = sourceText.match(/export const (\w+)\s*=\s*Router\(\)/);
  if (!routerMatch) {
    warn(`${fileName}: could not find "export const <name> = Router()" — skipping file.`);
    return [];
  }
  const routerVar = routerMatch[1];
  const prefix = mounts[routerVar];
  if (prefix === undefined) {
    warn(`${fileName}: router "${routerVar}" is not mounted via app.use() in app.ts — using empty prefix.`);
  }

  const routes = [];
  const callRe = new RegExp(`\\b${routerVar}\\.(${METHODS.join("|")})\\(`, "g");
  let m;
  while ((m = callRe.exec(sourceText))) {
    const method = m[1].toUpperCase();
    const openParenIndex = callRe.lastIndex - 1;

    let content;
    try {
      ({ content } = extractBalanced(sourceText, openParenIndex, "(", ")"));
    } catch {
      warn(`${fileName}: could not parse arguments for a "${method}" route — skipping.`);
      continue;
    }

    const args = splitTopLevelArgs(content);
    const pathArg = (args[0] ?? "").replace(/^["'`]|["'`]$/g, "");
    const handlerArg = args.slice(1).join(", ").trim();
    const fullPath = `${prefix ?? ""}${pathArg}`;

    if (/^[A-Za-z0-9_]+$/.test(handlerArg)) {
      routes.push({ method, path: fullPath, handlerName: handlerArg });
      continue;
    }

    // Inline handler, e.g. (_req, res) => { res.status(200).json(...); }
    const bodyMatch = handlerArg.match(/=>\s*\{([\s\S]*)\}$/);
    const body = bodyMatch ? bodyMatch[1] : handlerArg;
    routes.push({
      method,
      path: fullPath,
      handlerName: null,
      inlineDescription: findLeadingComment(sourceText, m.index),
      responses: extractResponses(body),
    });
  }
  return routes;
}
