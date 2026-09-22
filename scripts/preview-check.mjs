import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { adaptContentExport } from '../src/content/adapter.mjs';

const pinnedExport = JSON.parse(await readFile(new URL('../content/senshac-content-export.json', import.meta.url)));
const result = adaptContentExport(pinnedExport);
assert.equal(result.status, 'ready');
const { title, intro } = result.content;
assert.ok(title);
assert.ok(intro);

for (const locale of ['es', 'ca', 'en']) {
  const localizedRoute = await readBuiltPage(`${locale}/methods/index.html`);
  assert.doesNotMatch(localizedRoute, /<title>Redirecting to: \/404<\/title>/);
  assert.match(localizedRoute, /<main/);
}

const notFound = await readBuiltPage('404.html');
assert.match(notFound, /<html lang="en">/);
assert.match(notFound, /<main>/);
assert.match(notFound, /<h1 id="not-found-title">Page not found<\/h1>/);
assert.match(notFound, /That Senshac page does not exist\./);
assert.match(notFound, /href="\/">Return to the Senshac home page<\/a>/);
assert.match(notFound, /<title>Page not found \| Senshac<\/title>/);

console.log('preview: localized /methods routes are generated for es, ca, and en');

async function readBuiltPage(name) {
  for (const directory of ['dist/client', 'dist', 'public']) {
    try {
      return await readFile(new URL(`../${directory}/${name}`, import.meta.url), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`Built page not found: ${name}`);
}
