// Unit tests for backend-setup.js — plain node, no dependencies.
// Run: node test-backend-setup.js (also wired as `npm test` in desktop/).
const assert = require('assert');
const path = require('path');
const { runNodeScript, runWithRetries, prepareBackend } = require('./backend-setup');

function fakeSpawnFactory(script) {
  // Minimal child-process double: EventEmitter-ish with stdout/stderr.
  return (_execPath, _args, _opts) => {
    const handlers = {};
    const streams = {
      stdout: { on: (_ev, _cb) => {} },
      stderr: { on: (_ev, _cb) => {} },
    };
    const child = {
      ...streams,
      on: (ev, cb) => {
        handlers[ev] = cb;
        return child;
      },
    };
    setImmediate(() => (handlers.close || (() => {}))(script.code));
    return child;
  };
}

async function main() {
  // runNodeScript resolves ok on exit 0
  let r = await runNodeScript('migrate.js', { spawnFn: fakeSpawnFactory({ code: 0 }) });
  assert.strictEqual(r.ok, true, 'exit 0 should be ok');

  // runNodeScript resolves !ok on nonzero exit
  r = await runNodeScript('migrate.js', { spawnFn: fakeSpawnFactory({ code: 1 }) });
  assert.strictEqual(r.ok, false, 'exit 1 should not be ok');

  // spawn throw is converted, never throws
  r = await runNodeScript('migrate.js', {
    spawnFn: () => {
      throw new Error('nope');
    },
  });
  assert.strictEqual(r.ok, false, 'spawn throw should resolve !ok');

  // runWithRetries: fail twice then succeed
  let calls = 0;
  r = await runWithRetries('x', 's.js', {
    attempts: 5,
    sleepFn: () => Promise.resolve(),
    log: () => {},
    runFn: async () => (++calls < 3 ? { ok: false, code: 1, output: 'db down' } : { ok: true, code: 0, output: '' }),
  });
  assert.strictEqual(r.ok, true, 'should succeed on 3rd attempt');
  assert.strictEqual(calls, 3, 'should have attempted 3 times');

  // runWithRetries: exhausts attempts
  calls = 0;
  r = await runWithRetries('x', 's.js', {
    attempts: 3,
    sleepFn: () => Promise.resolve(),
    log: () => {},
    runFn: async () => {
      calls++;
      return { ok: false, code: 1, output: 'db down' };
    },
  });
  assert.strictEqual(r.ok, false, 'should fail after exhausting attempts');
  assert.strictEqual(calls, 3, 'should have attempted exactly 3 times');

  // prepareBackend: missing build
  r = await prepareBackend(path.join(__dirname, 'does-not-exist'), { log: () => {} });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.stage, 'missing-build');

  // prepareBackend: happy path against this repo's real backend dir (stubs runner)
  const seen = [];
  r = await prepareBackend(path.join(__dirname, '..', 'backend'), {
    log: () => {},
    sleepFn: () => Promise.resolve(),
    runFn: async (scriptPath) => {
      seen.push(path.basename(scriptPath));
      return { ok: true, code: 0, output: '' };
    },
  });
  assert.strictEqual(r.ok, true, 'happy path should be ok, got: ' + JSON.stringify(r));
  assert.deepStrictEqual(seen, ['migrate.js', 'seed.js'], 'migrate must run before seed');

  // prepareBackend: migrate failure short-circuits before seed
  const seen2 = [];
  r = await prepareBackend(path.join(__dirname, '..', 'backend'), {
    log: () => {},
    attempts: 2,
    sleepFn: () => Promise.resolve(),
    runFn: async (scriptPath) => {
      seen2.push(path.basename(scriptPath));
      return { ok: false, code: 1, output: 'ECONNREFUSED' };
    },
  });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.stage, 'migrate');
  assert.ok(seen2.every((s) => s === 'migrate.js'), 'seed must not run if migrate fails');

  console.log('backend-setup tests: all passed');
}

main().catch((e) => {
  console.error('backend-setup tests FAILED:', e);
  process.exit(1);
});
