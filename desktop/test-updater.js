// Unit tests for updater.js feed resolution — plain node, no electron needed.
// Run: node test-updater.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readFeedUrl } = require('./updater');

async function main() {
  // Empty/placeholder feed -> '' (app reports unavailable, never crashes).
  assert.strictEqual(readFeedUrl('/nonexistent-dir-xyz'), '', 'missing feed file -> empty');

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sjp-updtest-'));
  fs.writeFileSync(path.join(dir, 'update-feed.json'), JSON.stringify({ url: 'https://updates.example.com/' }));
  assert.strictEqual(readFeedUrl(dir), '', 'placeholder example.com URL is ignored');

  fs.writeFileSync(path.join(dir, 'update-feed.json'), JSON.stringify({ url: 'https://files.example.org/app/updates/' }));
  assert.strictEqual(readFeedUrl(dir), '', 'any example.org placeholder is ignored');

  fs.writeFileSync(path.join(dir, 'update-feed.json'), JSON.stringify({ url: 'https://cdn.myschool.edu.eg/sjp/updates/' }));
  assert.strictEqual(readFeedUrl(dir), 'https://cdn.myschool.edu.eg/sjp/updates/', 'real feed URL resolves');

  fs.writeFileSync(path.join(dir, 'update-feed.json'), 'not-json{{{');
  assert.strictEqual(readFeedUrl(dir), '', 'corrupt feed file -> empty');

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('updater tests: all passed');
}

main().catch((e) => {
  console.error('updater tests FAILED:', e);
  process.exit(1);
});
