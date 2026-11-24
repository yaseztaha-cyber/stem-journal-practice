// Ensures backend/node_modules is resolution-complete for packaging.
//
// The repo is an npm workspaces monorepo, so newly installed backend deps are
// hoisted to the workspace root node_modules — but the desktop bundle only
// copies backend/node_modules. Anything left hoisted would crash the packaged
// app with MODULE_NOT_FOUND. This script copies hoisted production deps (with
// their transitive production closure) into backend/node_modules before
// electron-builder runs. Existing local installs are left untouched.
// Run: node scripts/stage-backend-deps.js (wired into `npm run dist`).
const fs = require('fs');
const path = require('path');

const DESKTOP_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(DESKTOP_DIR, '..', 'backend');
const BACKEND_NM = path.join(BACKEND_DIR, 'node_modules');

function resolvePkgDir(name, fromDir) {
  // Mimic node resolution: walk up looking for node_modules/<name>/package.json
  let dir = fromDir;
  const parts = name.split('/');
  while (true) {
    const cand = path.join(dir, 'node_modules', ...parts, 'package.json');
    if (fs.existsSync(cand)) return path.join(dir, 'node_modules', ...parts);
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

// Ensure `name` exists under backend/node_modules (copy from wherever node
// resolves it, plus its production-only transitive closure). visited guards cycles.
function ensureLocal(name, visited = new Set()) {
  if (visited.has(name)) return { copied: [], skipped: true };
  visited.add(name);
  const dest = path.join(BACKEND_NM, ...name.split('/'));
  const copied = [];
  if (!fs.existsSync(path.join(dest, 'package.json'))) {
    const src = resolvePkgDir(name, BACKEND_DIR);
    if (!src) throw new Error(`Cannot resolve dependency "${name}" from ${BACKEND_DIR}`);
    if (path.resolve(src) === path.resolve(dest)) return { copied, skipped: true };
    copyDir(src, dest);
    copied.push(name);
  }
  // Recurse into production deps only (never devDependencies like @types/*).
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dest, 'package.json'), 'utf8'));
  } catch {
    return { copied };
  }
  for (const dep of Object.keys(manifest.dependencies ?? {})) {
    const r = ensureLocal(dep, visited);
    copied.push(...r.copied);
  }
  return { copied };
}

function main() {
  const backendPkg = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf8'));
  const all = [];
  for (const name of Object.keys(backendPkg.dependencies ?? {})) {
    const r = ensureLocal(name);
    all.push(...r.copied);
  }
  if (all.length) console.log(`[stage-backend-deps] staged into backend/node_modules: ${[...new Set(all)].join(', ')}`);
  else console.log('[stage-backend-deps] backend/node_modules already complete');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('[stage-backend-deps] FAILED:', (e && e.message) || e);
    process.exit(1);
  }
}

module.exports = { ensureLocal };
