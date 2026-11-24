/* Watchdog: starts dist/index.js and auto-restarts on uncaught crash. */
'use strict';
const { spawn } = require('child_process');
const { join }  = require('path');

const cwd        = join(__dirname, '..');
const RESTART_MS = 3000;
let child;

function start() {
  console.log('[watchdog] starting backend…');
  child = spawn(process.execPath, ['dist/index.js'], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env },
  });

  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') {
      console.log('[watchdog] clean exit, not restarting');
      process.exit(0);
    }
    console.log('[watchdog] exited (code ' + code + '), restarting in ' + RESTART_MS + ' ms…');
    setTimeout(start, RESTART_MS);
  });

  child.on('error', (err) => {
    console.error('[watchdog] spawn error:', err.message);
    setTimeout(start, RESTART_MS);
  });
}

process.on('SIGINT',  () => { if (child) child.kill('SIGINT'); });
process.on('SIGTERM', () => { if (child) child.kill('SIGTERM'); });

start();
