import { readFile, readdir } from 'node:fs/promises';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !['node_modules', '.git', 'dist', '.astro', '.pi', '.warren', '__generated__', 'admin'].includes(entry.name))
    .map((entry) => entry.isDirectory()
      ? walk(`${directory}/${entry.name}`)
      : [`${directory}/${entry.name}`]));
  return nested.flat();
}

const files = await walk('.');
const sourceFiles = files.filter((path) => /\.(astro|json|mjs|ts|md|yml)$/.test(path));
const secretPattern = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|token|password|secret)\s*[:=]\s*['"][^'"]+['"])/i;
const failures = [];
for (const path of sourceFiles) {
  const text = await readFile(path, 'utf8');
  if (text.includes('\r') || /[ \t]+$/m.test(text)) failures.push(`${path}: whitespace`);
  if (secretPattern.test(text)) failures.push(`${path}: secret-like value`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`lint: checked ${sourceFiles.length} files`);
