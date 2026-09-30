import { extractBalanced, extractResponses, findLeadingComment } from "./util.mjs";

// Finds an exported controller function by name and reads its leading `//` comment as its
// description (single source of truth, per requirements FR-3), plus its responses and which
// validator schema (if any) it calls `.safeParse()` on.
export function extractControllerInfo(sourceText, handlerName, validatorNames, warn = () => {}) {
  const fnRe = new RegExp(`export\\s+(?:async\\s+)?function\\s+${handlerName}\\s*\\(`);
  const fnMatch = fnRe.exec(sourceText);
  if (!fnMatch) return null;

  let description = findLeadingComment(sourceText, fnMatch.index);
  if (!description) {
    warn(`Handler "${handlerName}" has no leading "//" comment — using fallback description.`);
    description = "No description provided.";
  }

  const paramsOpenIndex = fnMatch.index + fnMatch[0].length - 1;
  const { endIndex: paramsEndIndex } = extractBalanced(sourceText, paramsOpenIndex, "(", ")");
  const bodyOpenIndex = sourceText.indexOf("{", paramsEndIndex);
  const { content: body } = extractBalanced(sourceText, bodyOpenIndex, "{", "}");

  const responses = extractResponses(body);

  let requestSchemaName = null;
  for (const name of validatorNames) {
    if (new RegExp(`\\b${name}\\.safeParse\\(`).test(body)) {
      requestSchemaName = name;
      break;
    }
  }

  return { description, responses, requestSchemaName };
}
