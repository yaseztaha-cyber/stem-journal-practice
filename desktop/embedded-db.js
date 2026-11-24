// Embedded PostgreSQL lifecycle for the packaged desktop app.
//
// Lets the app run with ZERO external dependencies: no Docker, no system
// Postgres. Data lives in the app's userData dir and survives updates.
//
// This module spawns the bundled postgres binaries directly (initdb/pg_ctl)
// instead of loading a wrapper package, so it works on every Node runtime
// including the packaged Electron Node (no ESM/CJS hazards).
//
// Electron-free (paths and the pg Pool class are injected) so it is
// unit-testable with plain node, mirroring backend-setup.js.

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

const DEFAULT_PORT = 5433;
const MAX_PORT_TRIES = 20;
const DATABASE = 'stem_journal';
const DB_USER = 'stemjournal';

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

// Locate the bundled postgres bin dir. Packaged builds unpack the binaries
// next to app.asar (they cannot execute from inside the archive).
function findBinDir(opts = {}) {
  const candidates = [];
  if (opts.binDir) candidates.push(opts.binDir);
  const resourcesPath = opts.resourcesPath || process.resourcesPath;
  if (resourcesPath) {
    // Packaged build: binaries are unpacked next to app.asar (they cannot
    // execute from inside the archive). Check this FIRST: the same files are
    // also visible inside app.asar but are not executable there.
    candidates.push(
      path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin'),
    );
  }
  // Dev layout: desktop/node_modules/... (real filesystem only, never app.asar)
  const devDir = path.join(__dirname, 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin');
  if (!/app\.asar/i.test(__dirname)) candidates.push(devDir);
  for (const dir of candidates) {
    if (fileExists(path.join(dir, 'initdb.exe')) && fileExists(path.join(dir, 'pg_ctl.exe')) && fileExists(path.join(dir, 'postgres.exe'))) {
      return dir;
    }
  }
  return null;
}

function runBin(bin, args, opts = {}) {
  const log = opts.log || (() => {});
  return new Promise((resolve) => {
    let child;
    try {
      // NOTE: pg_ctl start daemonizes postgres, which inherits our stdio
      // handles on Windows and would keep pipes open forever. Daemonizing
      // calls therefore run fully detached with ignored stdio; readiness is
      // still guaranteed by pg_ctl -w itself.
      const detached = !!opts.detached;
      child = spawn(bin, args, {
        stdio: detached ? 'ignore' : ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        detached,
      });
      if (detached && child.unref) child.unref();
    } catch (err) {
      resolve({ ok: false, code: -1, output: String((err && err.message) || err) });
      return;
    }
    let output = '';
    if (child.stdout) child.stdout.on('data', (c) => (output += c));
    if (child.stderr) child.stderr.on('data', (c) => (output += c));
    child.on('error', (err) => resolve({ ok: false, code: -1, output: output + String((err && err.message) || err) }));
    const timer = opts.timeoutMs ? setTimeout(() => {
      try {
        child.kill();
      } catch {
        /* ignore */
      }
      resolve({ ok: false, code: -1, output: output + '\ntimed out' });
    }, opts.timeoutMs) : null;
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      log(`[embedded-pg] ${path.basename(bin)} ${args.join(' ')} -> exit ${code}`);
      resolve({ ok: code === 0, code, output });
    });
  });
}

function readConfig(userDataDir) {
  const file = path.join(userDataDir, 'pgconfig.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cfg && typeof cfg.port === 'number' && typeof cfg.password === 'string' && cfg.password) {
      return { ...cfg, file };
    }
  } catch {
    /* missing or corrupt -> recreate below */
  }
  return { file };
}

function writeConfig(file, cfg) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ port: cfg.port, password: cfg.password, database: DATABASE, user: DB_USER }), 'utf8');
}

function isInitialised(databaseDir) {
  return fileExists(path.join(databaseDir, 'PG_VERSION'));
}

// Start (or reconnect to) the embedded cluster. Resolves
// { ok, connectionString, stop, fresh } — never throws.
async function ensureEmbedded(opts = {}) {
  const log = opts.log || (() => {});
  const userDataDir = opts.userDataDir;
  if (!userDataDir) return { ok: false, stage: 'no-datadir', detail: 'userDataDir is required' };
  const Pool = opts.Pool;
  if (!Pool) return { ok: false, stage: 'no-pool', detail: 'pg Pool class is required' };

  const binDir = findBinDir(opts);
  if (!binDir) {
    return { ok: false, stage: 'missing-binaries', detail: 'bundled postgres binaries not found' };
  }
  const initdb = path.join(binDir, 'initdb.exe');
  const pgctl = path.join(binDir, 'pg_ctl.exe');

  const stored = readConfig(userDataDir);
  let port = stored.port || DEFAULT_PORT;
  let password = stored.password;
  if (!password) password = crypto.randomBytes(24).toString('hex');
  const portInUse = opts.isPortInUse || (async () => false);
  let tries = 0;
  while ((await portInUse(port)) && tries < MAX_PORT_TRIES) {
    port += 1;
    tries += 1;
  }
  writeConfig(stored.file, { port, password });
  const databaseDir = path.join(userDataDir, 'pgdata');
  fs.mkdirSync(databaseDir, { recursive: true });
  const fresh = !isInitialised(databaseDir);

  if (fresh) {
    log('[embedded-pg] first run: initialising cluster in ' + databaseDir);
    const pwFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sjp-pw-')), 'pw');
    fs.writeFileSync(pwFile, password, 'utf8');
    const init = await runBin(initdb, ['-D', databaseDir, '-U', DB_USER, '--auth=scram-sha-256', `--pwfile=${pwFile}`, '-E', 'UTF8'], {
      log,
      timeoutMs: 120000,
    });
    try {
      fs.rmSync(path.dirname(pwFile), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    if (!init.ok) {
      return { ok: false, stage: 'embedded-init', detail: String(init.output || '').slice(-2000) };
    }
  }

  const pgLog = path.join(userDataDir, 'pg.log');
  const started = await runBin(pgctl, ['-D', databaseDir, '-l', pgLog, '-o', `-p ${port}`, '-w', '-t', '60', 'start'], {
    log,
    timeoutMs: 120000,
    detached: true,
  });
  if (!started.ok && !/already running|another server might be running/i.test(started.output || '')) {
    // Daemonized start captures no output; the server log has the real reason.
    let serverLog = '';
    try {
      const lines = fs.readFileSync(pgLog, 'utf8').split('\n');
      serverLog = lines.slice(-15).join('\n');
    } catch {
      /* no log yet */
    }
    return { ok: false, stage: 'embedded-start', detail: String(started.output || serverLog || 'pg_ctl start failed').slice(-2000) };
  }
  if (!started.ok) log('[embedded-pg] server already running, reusing it');

  const base = `postgres://${DB_USER}:${encodeURIComponent(password)}@127.0.0.1:${port}`;
  const connectionString = `${base}/${DATABASE}`;
  // Connect to the maintenance db first: the app database may not exist yet.
  const pool = new Pool({ connectionString: `${base}/postgres` });
  try {
    const exists = await pool.query(`SELECT 1 FROM pg_database WHERE datname='${DATABASE}'`);
    if (exists.rows.length === 0) {
      await pool.query(`CREATE DATABASE "${DATABASE}"`);
      log('[embedded-pg] database created: ' + DATABASE);
    }
  } catch (err) {
    await pool.end().catch(() => {});
    return { ok: false, stage: 'embedded-db', detail: String((err && err.message) || err).slice(-2000) };
  }
  await pool.end().catch(() => {});

  return {
    ok: true,
    connectionString,
    fresh,
    stop: async () => {
      const r = await runBin(pgctl, ['-D', databaseDir, '-m', 'fast', 'stop'], { log, timeoutMs: 60000 });
      if (!r.ok) log('[embedded-pg] stop: ' + String(r.output || '').slice(-500));
    },
  };
}

module.exports = { ensureEmbedded, findBinDir, DEFAULT_PORT, DATABASE, DB_USER };
