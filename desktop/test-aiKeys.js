// Unit tests for aiKeys.js — plain node, no electron needed.
// Run: node test-aiKeys.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readKeys, writeKeys, configuredProviders } = require('./aiKeys');

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sjp-aikeys-'));

  // Empty dir -> nothing configured, never throws.
  assert.deepStrictEqual(readKeys(dir), {});
  assert.deepStrictEqual(configuredProviders(dir), []);

  // Writes only non-empty trimmed values; junk keys ignored.
  const saved = writeKeys(dir, { groq: '  gsk_test123  ', aiml: '', mistral: '  ', evil: 'x' });
  assert.deepStrictEqual(saved, ['groq']);
  assert.deepStrictEqual(readKeys(dir), { OPENAI_API_KEY: 'gsk_test123' });
  assert.deepStrictEqual(configuredProviders(dir), ['groq']);

  // Second write merges by overwrite (file holds latest snapshot).
  writeKeys(dir, { mistral: 'mstrl_abc' });
  assert.deepStrictEqual(configuredProviders(dir), ['mistral']);

  // Corrupt file -> empty, never throws.
  fs.writeFileSync(path.join(dir, 'ai-keys.json'), 'not-json{{{');
  assert.deepStrictEqual(readKeys(dir), {});

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('aiKeys tests: all passed');
}

main().catch((e) => {
  console.error('aiKeys tests FAILED:', e);
  process.exit(1);
});
