import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { adaptContentExport } from '../src/content/adapter.mjs';

const pinnedExport = JSON.parse(await readFile(new URL('../content/senshac-content-export.json', import.meta.url)));
const result = adaptContentExport(pinnedExport);
assert.equal(result.status, 'ready');
const { title, intro } = result.content;
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

assert.match(html, /<html lang="en">/);
assert.match(html, /<main>/);
assert.match(html, new RegExp(`<h1 id="preview-title">${escapeRegExp(title)}<\\/h1>`));
assert.match(html, new RegExp(`<p>${escapeRegExp(intro)}<\\/p>`));
assert.match(html, /Preview slice — editorial content is owned by senshac-content\./);
assert.match(html, /<title>Senshac<\/title>/);

console.log('preview: / renders the validated pinned export content in the built route');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
