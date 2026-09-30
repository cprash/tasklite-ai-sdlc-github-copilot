// Parses backend/src/app.ts for `app.use("<prefix>", <routerVar>)` calls,
// so route paths are never hardcoded against a specific mount point.
export function extractAppMounts(appTsSource) {
  const mounts = {};
  const re = /app\.use\(\s*(["'`])([^"'`]+)\1\s*,\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)/g;
  let m;
  while ((m = re.exec(appTsSource))) {
    mounts[m[3]] = m[2];
  }
  return mounts;
}
