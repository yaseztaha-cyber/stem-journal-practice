// Tests for embedded-db.js — boots a REAL embedded PostgreSQL in a temp dir
// (proves the no-Docker path works on this machine), then stops it.
// Run: node test-embedded-db.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');
const { ensureEmbedded, findBinDir } = require('./embedded-db');

// Same probe main.js uses: never steal an occupied port.
function isPortInUse(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(true));
    probe.once('listening', () => probe.close(() => resolve(false)));
    probe.listen(port, '127.0.0.1');
  });
}

async function main() {
  // Packaged layout must resolve to the UNPACKED binaries, never app.asar.
  // (Skipped when no packaged build exists yet — dist builds it first.)
  const relResources = path.join(__dirname, 'release', 'win-unpacked', 'resources');
  if (fs.existsSync(relResources)) {
    const unpacked = findBinDir({ resourcesPath: relResources });
    assert.ok(unpacked && unpacked.includes('app.asar.unpacked'), 'packaged bin dir must be the unpacked one, got: ' + unpacked);
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sjp-embtest-'));
  const quiet = () => {};
  // Same pg Pool class main.js injects from the bundled backend.
  const { Pool } = require('../backend/node_modules/pg');
  console.log('booting embedded postgres in ' + dir + ' ...');
  const r = await ensureEmbedded({ userDataDir: dir, Pool, isPortInUse, log: quiet });
  assert.strictEqual(r.ok, true, 'embedded boot should succeed: ' + (r.detail || '') + ' stage=' + (r.stage || ''));
  assert.ok(/^postgres:\/\//.test(r.connectionString), 'connection string shape');
  assert.ok(!/5432/.test(r.connectionString.split('@')[1] || ''), 'must not use 5432');

  // Real query through the backend's own pg driver.
  const pool = new Pool({ connectionString: r.connectionString });
  const v = await pool.query('SELECT version() AS v');
  assert.ok(/PostgreSQL 1[6-9]/.test(v.rows[0].v), 'postgres 16+ running, got: ' + v.rows[0].v);
  await pool.query('CREATE TABLE emb_smoke(id SERIAL PRIMARY KEY, note TEXT)');
  await pool.query(`INSERT INTO emb_smoke(note) VALUES ('no-docker-ok')`);
  const c = await pool.query('SELECT COUNT(*)::int AS n FROM emb_smoke');
  assert.strictEqual(c.rows[0].n, 1, 'read/write round-trip');
  await pool.end();

  // Password persisted for next boot.
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'pgconfig.json'), 'utf8'));
  assert.ok(cfg.password && cfg.password.length >= 32, 'password persisted');

  await r.stop();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('embedded-db tests: all passed');
}

main().catch((e) => {
  console.error('embedded-db tests FAILED:', e);
  process.exit(1);
});
