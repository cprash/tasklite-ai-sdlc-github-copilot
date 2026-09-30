import { readFileSync, writeFileSync, existsSync } from "node:fs";

export const REASON_PHRASES = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
};

// Splits "a, b(c, d), e" into ["a", "b(c, d)", "e"] — respects nested (), {}, [] and string literals.
export function splitTopLevelArgs(str) {
  const parts = [];
  let depth = 0;
  let current = "";
  let inString = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      current += ch;
      if (ch === inString && str[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      current += ch;
      continue;
    }
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim().length) parts.push(current.trim());
  return parts;
}

// Given the index of an opening bracket, returns the content between it and its matching closer.
export function extractBalanced(str, startIndex, open = "(", close = ")") {
  if (str[startIndex] !== open) {
    throw new Error(`extractBalanced: expected "${open}" at index ${startIndex}`);
  }
  let depth = 0;
  let inString = null;
  for (let i = startIndex; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (ch === inString && str[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return { content: str.slice(startIndex + 1, i), endIndex: i };
    }
  }
  throw new Error(`extractBalanced: no matching "${close}" found starting at index ${startIndex}`);
}

// Scans a function/handler body for res.status(n) and HttpError(n, "msg") calls.
export function extractResponses(bodyText) {
  const responses = new Map();

  const statusRe = /res\.status\((\d+)\)/g;
  let m;
  while ((m = statusRe.exec(bodyText))) {
    const status = Number(m[1]);
    if (!responses.has(status)) responses.set(status, REASON_PHRASES[status] ?? "Response");
  }

  const httpErrorRe = /HttpError\(\s*(\d+)\s*,\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
  while ((m = httpErrorRe.exec(bodyText))) {
    const status = Number(m[1]);
    responses.set(status, m[2].slice(1, -1));
  }

  if (responses.size === 0 && /res\.json\(/.test(bodyText)) {
    responses.set(200, REASON_PHRASES[200]);
  }

  return [...responses.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([status, meaning]) => ({ status, meaning }));
}

// Compares ignoring CRLF/LF so a platform/git line-ending normalization alone never counts as a change.
export function writeFileIfChanged(filePath, content) {
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
  if (existing !== null && existing.replace(/\r\n/g, "\n") === content.replace(/\r\n/g, "\n")) return false;
  writeFileSync(filePath, content, "utf8");
  return true;
}

// Walks backwards from matchIndex to the nearest non-blank line and returns its `//` comment text, if any.
export function findLeadingComment(sourceText, matchIndex) {
  const lines = sourceText.slice(0, matchIndex).split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === "") continue;
    const commentMatch = line.match(/^\/\/\s?(.*)$/);
    return commentMatch ? commentMatch[1].trim() : null;
  }
  return null;
}
