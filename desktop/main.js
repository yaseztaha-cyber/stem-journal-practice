const { app, BrowserWindow, dialog, protocol, net, Menu, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const net_ = require('net');
const fs = require('fs');
const { prepareBackend } = require('./backend-setup');
const { ensureEmbedded } = require('./embedded-db');
const { readKeys, writeKeys, configuredProviders } = require('./aiKeys');

let stopEmbeddedDb = null;

const API_PORT = 4000;
const PROTOCOL = 'app';

function log(msg) {
  try {
    fs.appendFileSync(path.join(app.getPath('temp'), 'sjp-desktop.log'), `[${new Date().toISOString()}] ${msg}\n`);
  } catch {
    /* ignore */
  }
}

app.setAppUserModelId('com.stemjournal.desktop');

protocol.registerSchemesAsPrivileged([
  { scheme: PROTOCOL, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true } },
]);

function isPackaged() {
  return app.isPackaged;
}

function frontendDir() {
  if (isPackaged()) return path.join(process.resourcesPath, 'frontend');
  return path.join(__dirname, '..', 'frontend', 'dist');
}

function backendDir() {
  if (isPackaged()) return path.join(process.resourcesPath, 'backend');
  return path.join(__dirname, '..', 'backend');
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const probe = net_.createServer();
    probe.once('error', () => resolve(true));
    probe.once('listening', () => probe.close(() => resolve(false)));
    probe.listen(port, '127.0.0.1');
  });
}

function httpGetHealth(url, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(v);
      }
    };
    const timer = setTimeout(() => finish(null), timeoutMs ?? 4000);
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          finish(JSON.parse(body));
        } catch {
          finish(null);
        }
      });
    });
    req.on('error', () => finish(null));
    req.on('timeout', () => {
      req.destroy();
      finish(null);
    });
  });
}

async function startBackend() {
  if (await isPortInUse(API_PORT)) {
    console.log(`[desktop] API already running on :${API_PORT}, reusing it`);
    return true;
  }
  try {
    const distEntry = path.join(backendDir(), 'dist', 'index.js');
    if (!fs.existsSync(distEntry)) {
      log('[desktop] backend build missing: ' + distEntry);
      console.error('[desktop] backend build missing:', distEntry);
      return false;
    }
    const { default: appServer } = require(distEntry);
    await new Promise((resolve, reject) => {
      const srv = appServer.listen({ port: API_PORT, host: '127.0.0.1' }, resolve);
      srv.once('error', reject);
    });
    log('[desktop] API started on :' + API_PORT);
    console.log(`[desktop] API started on :${API_PORT}`);
    return true;
  } catch (err) {
    log('[desktop] failed to start API: ' + (err && err.stack ? err.stack : err));
    console.error('[desktop] failed to start API:', err);
    return false;
  }
}

function registerAppProtocol() {
  const dist = frontendDir();
  protocol.handle(PROTOCOL, (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/index.html';
    const filePath = path.resolve(dist, '.' + pathname);
    if (!filePath.startsWith(path.resolve(dist))) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(filePath).toString()).then(
      (res) => res,
      () => net.fetch(pathToFileURL(path.join(dist, 'index.html')).toString()),
    );
  });
}

// net.fetch needs pathToFileURL
function pathToFileURL(p) {
  return require('url').pathToFileURL(p);
}

async function createWindow() {
  const win = new BrowserWindow({
    title: 'STEM Journal Practice',
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#f6f8f7',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenu(null);

  win.once('ready-to-show', () => win.show());
  win.webContents.on('did-finish-load', () => log('[desktop] window finished loading'));
  win.webContents.on('did-fail-load', (_e, code, desc) => log('[desktop] window failed to load: ' + code + ' ' + desc));
  win.loadURL(`${PROTOCOL}://sjp/index.html`);

  // In-app updates: renderer asks over IPC, main reports back; background
  // events stream to the window so Settings can show live status.
  const { initUpdater } = require('./updater');
  const updater = initUpdater({
    packaged: isPackaged(),
    resourcesDir: isPackaged() ? process.resourcesPath : undefined,
    log,
    notify: (status) => {
      try {
        win.webContents.send('sjp:update-status', status);
      } catch {
        /* window gone */
      }
    },
  });
  ipcMain.handle('sjp:get-version', () => updater.getVersion());
  ipcMain.handle('sjp:check-updates', async () => updater.check());
  ipcMain.handle('sjp:get-ai-providers', () => configuredProviders(app.getPath('userData')));
  ipcMain.handle('sjp:save-ai-keys', (_event, keys) => {
    const saved = writeKeys(app.getPath('userData'), keys ?? {});
    log('[desktop] ai keys saved for: ' + (saved.join(', ') || 'none'));
    return saved;
  });
  ipcMain.handle('sjp:restart-app', () => {
    app.relaunch();
    app.exit(0);
  });
  return updater;
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', async () => {
  if (stopEmbeddedDb) {
    try {
      await stopEmbeddedDb();
    } catch {
      /* ignore */
    }
    stopEmbeddedDb = null;
  }
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  app.whenReady()
    .then(async () => {
      try {
        log('[desktop] app ready');
        Menu.setApplicationMenu(null);
        registerAppProtocol();
        // Packaged app: self-contained embedded PostgreSQL (no Docker needed).
        // Data lives in userData/pgdata and survives updates. Dev mode keeps
        // using the developer's own DATABASE_URL / Docker container.
        let setup = { ok: true, stage: 'reused' };
        if (!(await isPortInUse(API_PORT))) {
          let dbEnv = {};
          if (isPackaged()) {
            // Device-local AI keys (Settings → AI providers). Env vars and
            // real environment always win over the file.
            try {
              const fileKeys = readKeys(app.getPath('userData'));
              for (const [k, v] of Object.entries(fileKeys)) {
                if (!process.env[k]) process.env[k] = v;
              }
              const present = Object.keys(fileKeys).filter((k) => process.env[k]);
              log('[desktop] ai providers configured: ' + (present.length ? present.join(', ') : 'none (local engine only)'));
            } catch (e) {
              log('[desktop] ai keys unreadable: ' + String((e && e.message) || e));
            }
            // pg ships inside the bundled backend; reuse its driver (pure JS, runs anywhere).
            const { Pool } = require(path.join(backendDir(), 'node_modules', 'pg'));
            const emb = await ensureEmbedded({ userDataDir: app.getPath('userData'), isPortInUse, Pool, log });
            log('[desktop] ensureEmbedded -> ' + JSON.stringify({ ok: emb.ok, stage: emb.stage, fresh: emb.fresh }));
            if (!emb.ok) {
              setup = emb;
            } else {
              process.env.DATABASE_URL = emb.connectionString;
              dbEnv = { DATABASE_URL: emb.connectionString };
              stopEmbeddedDb = emb.stop;
            }
          }
          if (setup.ok) {
            setup = await prepareBackend(backendDir(), { log, env: dbEnv });
            log('[desktop] prepareBackend -> ' + JSON.stringify({ ok: setup.ok, stage: setup.stage }));
          }
          // Packaged mode must NEVER silently fall back to a developer Docker
          // database: without its embedded DB the app refuses to serve.
          if (isPackaged() && !setup.ok) {
            log('[desktop] packaged setup failed, refusing to start API without embedded DB');
          }
        } else {
          log('[desktop] port in use, reusing existing server; skipping migrate/seed');
        }
        const mayServe = !isPackaged() || setup.ok;
        const started = mayServe ? await startBackend() : false;
        log('[desktop] startBackend -> ' + started);

        if (setup.stage === 'missing-build') {
          dialog.showMessageBoxSync({
            type: 'error',
            title: 'STEM Journal Practice',
            message: 'The built-in server files are missing.',
            detail: 'The installation looks incomplete. Reinstall the app to repair it.',
          });
        } else if (setup.stage === 'migrate') {
          dialog.showMessageBoxSync({
            type: 'error',
            title: 'STEM Journal Practice',
            message: 'The built-in database could not start.',
            detail: 'Restart the app. If it persists, check the log file and free up disk space. Your answers stay safe in the app data folder.',
          });
        } else if (setup.stage === 'embedded-start') {
          dialog.showMessageBoxSync({
            type: 'error',
            title: 'STEM Journal Practice',
            message: 'The built-in database could not start.',
            detail: 'Your antivirus may be blocking the database files, or ports near 5433 are in use. Allow the app through, then restart. Details are in the log file.',
          });
        } else if (setup.stage === 'seed') {
          dialog.showMessageBox({
            type: 'warning',
            title: 'STEM Journal Practice',
            message: 'Practice questions could not be prepared.',
            detail: 'The database is reachable but loading the question bank failed. Restart the app; if it persists, reinstall. Details are in the log file.',
          });
        }

        if (!started) {
          dialog.showMessageBoxSync({
            type: 'error',
            title: 'STEM Journal Practice',
            message: 'Could not start the built-in server.',
            detail: 'Close other instances on port 4000, or start the app again. Your saved data is safe.',
          });
        } else {
          const health = await httpGetHealth(`http://127.0.0.1:${API_PORT}/api/health`, 4000);
          log('[desktop] health -> ' + JSON.stringify(health));
          if (!health || !health.ok) {
            dialog.showMessageBox({
              type: 'warning',
              title: 'STEM Journal Practice',
              message: 'The built-in server is not responding.',
              detail: 'Start the app again. If the problem persists, check that nothing else uses port 4000. Your answers stay safe in the database.',
            });
          } else if (health.db === false) {
            dialog.showMessageBox({
              type: 'warning',
              title: 'STEM Journal Practice',
              message: 'The database is not reachable.',
              detail: 'Restart the app. If the problem persists, check the log file. Your answers stay safe in the app data folder.',
            });
          }
        }

        await createWindow();
      } catch (err) {
        log('[desktop] fatal: ' + (err && err.stack ? err.stack : err));
        console.error(err);
      }
    });
}