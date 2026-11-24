// In-app updates via electron-updater (generic provider).
//
// How it works: each release publishes the installer + latest.yml to any
// static HTTPS host. The feed URL lives in update-feed.json next to the app
// resources so it can change without code edits. Until a feed is configured,
// update checks report "unavailable" instead of failing.
//
// Electron-only (autoUpdater), so this module is required lazily from main.js.

function readFeedUrl(resourcesDir, extraCandidates) {
  const fs = require('fs');
  const path = require('path');
  const files = [
    ...(extraCandidates || []),
    resourcesDir ? path.join(resourcesDir, 'update-feed.json') : null,
    path.join(__dirname, 'update-feed.json'),
  ].filter(Boolean);
  for (const f of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const url = String(raw && raw.url ? raw.url : '').trim();
      // Reserved placeholder domains never count as a configured feed.
      if (/example\.(com|org|net)/i.test(url)) continue;
      if (url) return url;
    } catch {
      /* missing or invalid -> next candidate */
    }
  }
  return '';
}

// Starts the updater. Returns { check(), getVersion() }.
// notify(status) receives { status, version?, message } for the UI.
function initUpdater(opts = {}) {
  const log = opts.log || (() => {});
  const notify = opts.notify || (() => {});
  const feedUrl = readFeedUrl(opts.resourcesDir);
  const state = { feedUrl, lastCheck: null };

  let autoUpdater = null;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (err) {
    log('[updater] electron-updater unavailable: ' + String((err && err.message) || err));
  }

  if (!autoUpdater || !opts.packaged) {
    if (!opts.packaged) log('[updater] dev mode: update checks disabled');
    return {
      state,
      getVersion: () => { try { return require('electron').app.getVersion(); } catch { return 'dev'; } },
      async check() {
        return { status: 'unavailable', message: 'Updates are checked in the installed app, not in dev mode.' };
      },
    };
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = { info: log, warn: log, error: log, debug: () => {}, transports: undefined };

  autoUpdater.on('checking-for-update', () => notify({ status: 'checking', message: 'Checking for updates…' }));
  autoUpdater.on('update-available', (info) => {
    state.lastCheck = { status: 'available', version: info && info.version };
    notify({ status: 'available', version: info && info.version, message: `Version ${info && info.version} found — downloading in the background.` });
  });
  autoUpdater.on('update-not-available', (info) => {
    state.lastCheck = { status: 'up-to-date', version: info && info.version };
    notify({ status: 'up-to-date', message: 'You are on the latest version.' });
  });
  autoUpdater.on('update-downloaded', (info) => {
    state.lastCheck = { status: 'downloaded', version: info && info.version };
    notify({ status: 'downloaded', version: info && info.version, message: `Version ${info && info.version} downloaded — it installs when you quit the app.` });
  });
  autoUpdater.on('error', (err) => {
    const message = String((err && err.message) || err);
    state.lastCheck = { status: 'error', message };
    log('[updater] error: ' + message.slice(-500));
    notify({ status: 'error', message: 'Update check failed. Check your connection and try again.' });
  });

  async function check() {
    if (!state.feedUrl) {
      return { status: 'unavailable', message: 'No update feed configured yet. See UPDATES.md to publish releases.' };
    }
    try {
      autoUpdater.setFeedURL({ provider: 'generic', url: state.feedUrl });
    } catch (err) {
      return { status: 'error', message: 'Bad update feed URL.' };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      if (!result || !result.updateInfo || String(result.updateInfo.version || '') === currentVersion()) {
        return { status: 'up-to-date', message: 'You are on the latest version.' };
      }
      return { status: 'available', version: result.updateInfo.version, message: `Version ${result.updateInfo.version} found — downloading.` };
    } catch (err) {
      return { status: 'error', message: 'Update check failed. Check your connection and try again.' };
    }
  }

  function currentVersion() {
    try {
      return require('electron').app.getVersion();
    } catch {
      return '';
    }
  }

  // Silent startup check (user-initiated checks report through notify/check).
  setTimeout(() => {
    if (state.feedUrl) {
      autoUpdater.checkForUpdates().catch((e) => log('[updater] startup check failed: ' + String((e && e.message) || e).slice(-300)));
    } else {
      log('[updater] no feed configured; skipping startup check');
    }
  }, 20000);

  return { state, check, getVersion: currentVersion };
}

module.exports = { initUpdater, readFeedUrl };
