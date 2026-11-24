// Device-local AI provider keys for the packaged app.
//
// backend/.env is excluded from the bundle on purpose (secrets must not
// ship), so the desktop app reads keys from %APPDATA%/.../ai-keys.json,
// written by Settings → App updates → AI providers. Values are only ever
// used to call the providers; presence (never values) is logged.
// Electron-free and unit-testable.

const fs = require('fs');
const path = require('path');

const KEY_MAP = {
  groq: 'OPENAI_API_KEY',
  aiml: 'AIML_API_KEY',
  mistral: 'MISTRAL_API_KEY',
};

function keysFile(userDataDir) {
  return path.join(userDataDir, 'ai-keys.json');
}

function readKeys(userDataDir) {
  try {
    const raw = JSON.parse(fs.readFileSync(keysFile(userDataDir), 'utf8'));
    const out = {};
    for (const [short, env] of Object.entries(KEY_MAP)) {
      const v = typeof raw[short] === 'string' ? raw[short].trim() : '';
      if (v) out[env] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeKeys(userDataDir, keys) {
  const clean = {};
  for (const short of Object.keys(KEY_MAP)) {
    const v = typeof keys[short] === 'string' ? keys[short].trim() : '';
    if (v) clean[short] = v;
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(keysFile(userDataDir), JSON.stringify(clean), 'utf8');
  return Object.keys(clean);
}

// Names of configured providers (for status display, never values).
function configuredProviders(userDataDir) {
  const env = readKeys(userDataDir);
  const out = [];
  for (const [short, name] of Object.entries(KEY_MAP)) {
    if (env[name]) out.push(short);
  }
  return out;
}

module.exports = { readKeys, writeKeys, configuredProviders, KEY_MAP };
