const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { ensureEmbedded } = require(path.join(__dirname, 'desktop', 'embedded-db.js'));
const { Pool } = require(path.join(__dirname, 'backend', 'node_modules', 'pg'));

async function main() {
  const dir = path.join(os.tmpdir(), 'sjp-embdev-' + Date.now());
  const r = await ensureEmbedded({
    userDataDir: dir,
    Pool,
    isPortInUse: async (port) => {
      return new Promise((resolve) => {
        const probe = require('net').createServer();
        probe.once('error', () => resolve(true));
        probe.once('listening', () => probe.close(() => resolve(false)));
        probe.listen(port, '127.0.0.1');
      });
    },
    log: (m) => console.log('[emb-pg]', m),
  });
  if (!r.ok) {
    console.error('embedded pg failed:', r.stage, r.detail);
    process.exit(1);
  }
  const conn = r.connectionString;
  console.log('[emb-pg] connection string:', conn);
  process.env.DATABASE_URL = conn;

  await runScript('npx', ['tsx', 'src/migrate.ts'], 'migrate');
  await runScript('npx', ['tsx', 'src/seed.ts'], 'seed');

  console.log('[backend] starting on :4000 with embedded PG...');
  const backend = spawn('cmd', ['/c', 'npx tsx watch src/index.ts'], {
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, DATABASE_URL: conn },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  backend.stdout.on('data', (c) => process.stdout.write(c));
  backend.stderr.on('data', (c) => process.stderr.write(c));
  backend.on('close', (code) => {
    console.log('[backend] exited', code);
    process.exit(code);
  });
}

function runScript(bin, args, label) {
  return new Promise((resolve, reject) => {
    const cmdStr = `${bin} ${args.join(' ')}`;
    const child = spawn('cmd', ['/c', cmdStr], {
      cwd: path.join(__dirname, 'backend'),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    if (child.stdout) child.stdout.on('data', (c) => { output += c; process.stdout.write(c); });
    if (child.stderr) child.stderr.on('data', (c) => { output += c; process.stderr.write(c); });
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[${label}] ok`);
        resolve();
      } else {
        console.error(`[${label}] failed with code ${code}`);
        reject(new Error(`${label} failed`));
      }
    });
    child.on('error', (err) => {
      console.error(`[${label}] spawn error:`, err.message);
      reject(err);
    });
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
