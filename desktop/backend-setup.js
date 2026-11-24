// First-run backend preparation for the desktop app (no electron dependency,
// so this module is unit-testable with plain node).
//
// The packaged app has no `node` binary, but Electron's executable can run as
// Node via ELECTRON_RUN_AS_NODE=1, so migrate/seed run as child processes.
// They are separate processes (not require()d) because dist/migrate.js and
// dist/seed.js are self-executing scripts that end the pg pool on completion.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run a compiled backend script (dist/migrate.js, dist/seed.js). Resolves
// { ok, code, output } — never throws, never exits the parent process.
function runNodeScript(scriptPath, opts = {}) {
  const spawnFn = opts.spawnFn || spawn;
  return new Promise((resolve) => {
    let child;
    try {
      child = spawnFn(process.execPath, [scriptPath], {
        cwd: opts.cwd,
        env: { ...process.env, ...(opts.env || {}), ELECTRON_RUN_AS_NODE: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      resolve({ ok: false, code: -1, output: String((err && err.message) || err) });
      return;
    }
    let output = '';
    if (child.stdout) child.stdout.on('data', (c) => (output += c));
    if (child.stderr) child.stderr.on('data', (c) => (output += c));
    child.on('error', (err) => resolve({ ok: false, code: -1, output: output + String((err && err.message) || err) }));
    child.on('close', (code) => resolve({ ok: code === 0, code, output }));
  });
}

// Run a script, retrying while the database is still starting up.
async function runWithRetries(label, scriptPath, opts = {}) {
  const attempts = opts.attempts ?? 12;
  const delayMs = opts.delayMs ?? 5000;
  const log = opts.log || (() => {});
  const sleepFn = opts.sleepFn || defaultSleep;
  const runFn = opts.runFn || runNodeScript;
  let last = { ok: false, code: -1, output: 'never ran' };
  for (let i = 1; i <= attempts; i++) {
    log(`[desktop] ${label}: attempt ${i}/${attempts}`);
    last = await runFn(scriptPath, { ...opts, cwd: opts.cwd });
    if (last.ok) {
      log(`[desktop] ${label}: ok`);
      return last;
    }
    log(`[desktop] ${label}: failed (code ${last.code}); will retry`);
    if (i < attempts) await sleepFn(delayMs);
  }
  return last;
}

// Migrate (with DB-wait retries) then seed (idempotent, run once).
// Returns { ok, stage, detail? } where stage is one of:
// 'reused' | 'ready' | 'missing-build' | 'migrate' | 'seed'.
async function prepareBackend(backendDir, opts = {}) {
  const log = opts.log || (() => {});
  const migrateScript = path.join(backendDir, 'dist', 'migrate.js');
  const seedScript = path.join(backendDir, 'dist', 'seed.js');
  if (!fs.existsSync(migrateScript) || !fs.existsSync(seedScript)) {
    return { ok: false, stage: 'missing-build', detail: 'backend dist build not found: ' + backendDir };
  }
  const mig = await runWithRetries('migrate', migrateScript, { ...opts, cwd: backendDir, log });
  if (!mig.ok) return { ok: false, stage: 'migrate', detail: String(mig.output || '').slice(-2000) };
  // Seed is idempotent; first run takes a while (hundreds of questions), later runs are quick.
  log('[desktop] seed: running');
  const runFn = opts.runFn || runNodeScript;
  const sd = await runFn(seedScript, { ...opts, cwd: backendDir });
  if (!sd.ok) return { ok: false, stage: 'seed', detail: String(sd.output || '').slice(-2000) };
  log('[desktop] seed: ok');
  return { ok: true, stage: 'ready' };
}

module.exports = { runNodeScript, runWithRetries, prepareBackend };
