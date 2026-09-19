import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const ignoredDirectories = new Set(['.git', 'node_modules', '.astro', '.pi', '.warren', '__generated__', 'admin']);
const files = await walk('.');
const forbiddenFiles = files.filter((file) => {
  const name = file.slice(file.lastIndexOf('/') + 1);
  return /^(?:\.env(?:\..*)?|.*\.(?:pem|key|crt)|wrangler\.(?:toml|json)|tina\.config\..*|.*(?:cloudflare|pages|r2).*)$/i.test(name);
});
const sourceFiles = files.filter((file) => /\.(?:astro|html|json|mjs|ts|md|yml|yaml)$/.test(file));
const assignmentPattern = new RegExp(
  '(?:api[_-]?key|token|password|secret)\\s*[:=]\\s*["\\\'][^"\\\']+["\\\']',
  'i',
);
const privateKeyMarker = ['-----BEGIN ', 'PRIVATE KEY-----'].join('');
const failures = [...forbiddenFiles.map((file) => `${file}: excluded file`)].map(String);

for (const file of sourceFiles) {
  const text = await readFile(file, 'utf8');
  if (text.includes(privateKeyMarker)) failures.push(`${file}: private key marker`);
  if (assignmentPattern.test(text)) failures.push(`${file}: secret-like assignment`);
}

assert.equal(await readFile('astro.config.mjs', 'utf8').then((text) => text.includes("site: 'https://preview.invalid'")), true);
await access('content/tina-fixture.json');
await access('content/tina-schema.json');
await access('dist/index.html');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`repository: checked ${sourceFiles.length} source files; preview exclusions and secret boundaries are green`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !ignoredDirectories.has(entry.name))
    .map((entry) => entry.isDirectory()
      ? walk(`${directory}/${entry.name}`)
      : [`${directory}/${entry.name}`]));
  return nested.flat();
}
