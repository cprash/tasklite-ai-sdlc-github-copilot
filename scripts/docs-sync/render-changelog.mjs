export function buildSnapshot(endpoints) {
  return endpoints
    .map((ep) => ({
      method: ep.method,
      path: ep.path,
      description: ep.description,
      requestFields: ep.requestSchema
        ? ep.requestSchema.fields.map((f) => `${f.name}:${f.type}:${f.required}`).sort()
        : [],
    }))
    .sort((a, b) => (a.method + a.path).localeCompare(b.method + b.path));
}

function key(ep) {
  return `${ep.method} ${ep.path}`;
}

// Compares the current endpoint snapshot to the previous run's snapshot (null on first run).
export function diffSnapshots(prev, curr) {
  if (prev === null) {
    return { isFirstRun: true, added: curr, removed: [], changed: [], hasChanges: curr.length > 0 };
  }

  const prevByKey = new Map(prev.map((e) => [key(e), e]));
  const currByKey = new Map(curr.map((e) => [key(e), e]));

  const added = curr.filter((e) => !prevByKey.has(key(e)));
  const removed = prev.filter((e) => !currByKey.has(key(e)));
  const changed = curr.filter((e) => {
    const before = prevByKey.get(key(e));
    return before && JSON.stringify(before) !== JSON.stringify(e);
  });

  return { isFirstRun: false, added, removed, changed, hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0 };
}

export function renderChangelogEntry(diff, dateOrString) {
  const date = dateOrString instanceof Date ? dateOrString.toISOString().slice(0, 10) : dateOrString;
  const lines = [`### ${date} — Documentation sync`, ""];

  if (diff.isFirstRun) {
    lines.push(`- Initial automated documentation baseline (${diff.added.length} endpoint${diff.added.length === 1 ? "" : "s"}).`);
  } else {
    for (const e of diff.added) lines.push(`- Added \`${e.method} ${e.path}\` to the API documentation.`);
    for (const e of diff.removed) lines.push(`- Removed \`${e.method} ${e.path}\` from the API documentation.`);
    for (const e of diff.changed) lines.push(`- Updated documentation for \`${e.method} ${e.path}\`.`);
  }

  lines.push("");
  return lines.join("\n");
}

// Inserts the entry right after the "## [Unreleased]" heading line, creating it if it doesn't exist.
// Anchored to a whole line (and its own newline only) so trailing blank lines aren't swallowed into
// the match and prose mentioning the marker elsewhere isn't matched.
export function patchChangelog(changelogContent, entryMarkdown) {
  const headingRe = /^## \[Unreleased\][^\n]*\r?\n/m;
  const match = headingRe.exec(changelogContent);
  const entry = entryMarkdown.trim();

  if (!match) {
    return `${changelogContent.trim()}\n\n## [Unreleased]\n\n${entry}\n`;
  }

  const headingEnd = match.index + match[0].length;
  const before = changelogContent.slice(0, headingEnd);
  const remainder = changelogContent.slice(headingEnd).replace(/^(\r?\n)+/, "");

  return remainder.length > 0 ? `${before}\n${entry}\n\n${remainder}` : `${before}\n${entry}\n`;
}
