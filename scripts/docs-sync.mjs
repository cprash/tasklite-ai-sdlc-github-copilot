#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractAppMounts } from "./docs-sync/extract-app-mounts.mjs";
import { extractRoutesFromFile } from "./docs-sync/extract-routes.mjs";
import { extractValidators } from "./docs-sync/extract-validators.mjs";
import { extractControllerInfo } from "./docs-sync/extract-controllers.mjs";
import { renderApiDoc } from "./docs-sync/render-api-doc.mjs";
import { renderReadmeTable, patchReadme } from "./docs-sync/render-readme-table.mjs";
import { buildSnapshot, diffSnapshots, renderChangelogEntry, patchChangelog } from "./docs-sync/render-changelog.mjs";
import { writeFileIfChanged } from "./docs-sync/util.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Runs the full extract -> merge -> render pipeline. Returns a summary; never touches process.exit.
export function runDocsSync({ cwd = repoRoot } = {}) {
  const warnings = [];
  const warn = (msg) => warnings.push(msg);

  const backendSrc = path.join(cwd, "backend", "src");
  const mounts = extractAppMounts(readFileSync(path.join(backendSrc, "app.ts"), "utf8"));

  const routesDir = path.join(backendSrc, "routes");
  const routes = readdirSync(routesDir)
    .filter((f) => f.endsWith(".routes.ts"))
    .flatMap((file) => extractRoutesFromFile(readFileSync(path.join(routesDir, file), "utf8"), mounts, file, warn));

  const validatorsDir = path.join(backendSrc, "validators");
  const validators = existsSync(validatorsDir)
    ? readdirSync(validatorsDir)
        .filter((f) => f.endsWith(".validators.ts"))
        .flatMap((file) => extractValidators(readFileSync(path.join(validatorsDir, file), "utf8")))
    : [];
  const validatorsByName = Object.fromEntries(validators.map((v) => [v.name, v]));

  const controllersDir = path.join(backendSrc, "controllers");
  const controllerFiles = existsSync(controllersDir)
    ? readdirSync(controllersDir).filter((f) => f.endsWith(".controller.ts"))
    : [];
  const controllerSourceCache = new Map();
  const readController = (file) => {
    if (!controllerSourceCache.has(file)) {
      controllerSourceCache.set(file, readFileSync(path.join(controllersDir, file), "utf8"));
    }
    return controllerSourceCache.get(file);
  };

  const endpoints = routes.map((route) => {
    if (!route.handlerName) {
      return {
        method: route.method,
        path: route.path,
        description: route.inlineDescription ?? "No description provided.",
        requestSchema: null,
        responses: route.responses,
      };
    }

    let info = null;
    for (const file of controllerFiles) {
      info = extractControllerInfo(readController(file), route.handlerName, Object.keys(validatorsByName), warn);
      if (info) break;
    }
    if (!info) {
      warn(`No controller function found for handler "${route.handlerName}" (route ${route.method} ${route.path}).`);
      info = { description: "No description provided.", responses: [], requestSchemaName: null };
    }

    return {
      method: route.method,
      path: route.path,
      description: info.description,
      requestSchema: info.requestSchemaName ? validatorsByName[info.requestSchemaName] ?? null : null,
      responses: info.responses,
    };
  });

  const docsDir = path.join(cwd, "docs");
  const apiDocChanged = writeFileIfChanged(path.join(docsDir, "API.md"), renderApiDoc(endpoints));

  const readmePath = path.join(cwd, "README.md");
  const readmeAfter = patchReadme(readFileSync(readmePath, "utf8"), renderReadmeTable(endpoints));
  const readmeChanged = writeFileIfChanged(readmePath, readmeAfter);

  const snapshotPath = path.join(docsDir, ".docs-sync-snapshot.json");
  const prevSnapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : null;
  const currSnapshot = buildSnapshot(endpoints);
  const diff = diffSnapshots(prevSnapshot, currSnapshot);

  let changelogChanged = false;
  if (diff.hasChanges) {
    const changelogPath = path.join(cwd, "CHANGELOG.md");
    const changelogBefore = existsSync(changelogPath) ? readFileSync(changelogPath, "utf8") : "# Changelog\n\n## [Unreleased]\n";
    const entry = renderChangelogEntry(diff, new Date());
    changelogChanged = writeFileIfChanged(changelogPath, patchChangelog(changelogBefore, entry));
    writeFileSync(snapshotPath, `${JSON.stringify(currSnapshot, null, 2)}\n`, "utf8");
  }

  return { endpoints, warnings, changed: { apiDoc: apiDocChanged, readme: readmeChanged, changelog: changelogChanged } };
}

function main() {
  const result = runDocsSync();
  console.log(`docs-sync: processed ${result.endpoints.length} endpoint(s).`);
  console.log(`  docs/API.md ... ${result.changed.apiDoc ? "updated" : "unchanged"}`);
  console.log(`  README.md ..... ${result.changed.readme ? "updated" : "unchanged"}`);
  console.log(`  CHANGELOG.md .. ${result.changed.changelog ? "updated" : "unchanged"}`);
  for (const w of result.warnings) console.warn(`  warning: ${w}`);
  if (!result.changed.apiDoc && !result.changed.readme && !result.changed.changelog) {
    console.log("docs-sync: no documentation changes detected.");
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    main();
  } catch (err) {
    console.error("docs-sync failed:", err.message);
    process.exit(1);
  }
}
