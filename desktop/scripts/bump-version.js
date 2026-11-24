// Bumps the desktop patch version (1.0.0 -> 1.0.1) for a release build.
// Usage: node scripts/bump-version.js [major|minor|patch]
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
const kind = process.argv[2] || 'patch';
const parts = String(pkg.version || '1.0.0').split('.').map((n) => parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);
if (kind === 'major') {
  parts[0] += 1;
  parts[1] = 0;
  parts[2] = 0;
} else if (kind === 'minor') {
  parts[1] += 1;
  parts[2] = 0;
} else {
  parts[2] += 1;
}
pkg.version = parts.join('.');
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log('version -> ' + pkg.version);
