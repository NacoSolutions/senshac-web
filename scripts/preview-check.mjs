import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { adaptContentExport } from '../src/content/adapter.mjs';

const pinnedExport = JSON.parse(await readFile(new URL('../content/senshac-content-export.json', import.meta.url)));
const result = adaptContentExport(pinnedExport);
assert.equal(result.status, 'ready');
const { title, intro } = result.content;
const html = await readBuiltPage('index.html');

assert.match(html, /<html lang="en">/);
assert.match(html, /<main>/);
assert.match(html, new RegExp(`<h1 id="preview-title">${escapeRegExp(title)}<\\/h1>`));
assert.match(html, new RegExp(`<p>${escapeRegExp(intro)}<\\/p>`));
assert.match(html, /Preview slice — editorial content is owned by senshac-content\./);
assert.match(html, /<title>Senshac<\/title>/);

const notFound = await readBuiltPage('404.html');
assert.match(notFound, /<html lang="en">/);
assert.match(notFound, /<main>/);
assert.match(notFound, /<h1 id="not-found-title">Page not found<\/h1>/);
assert.match(notFound, /That Senshac page does not exist\./);
assert.match(notFound, /href="\/">Return to the Senshac home page<\/a>/);
assert.match(notFound, /<title>Page not found \| Senshac<\/title>/);

const preview = spawn('node_modules/.bin/astro', ['preview', '--host', '127.0.0.1', '--port', '4321'], {
  stdio: ['ignore', 'ignore', 'pipe'],
});
try {
  await waitForPreview();
  const response = await fetch('http://127.0.0.1:4321/no-such-route');
  const body = await response.text();
  assert.ok([404, 500].includes(response.status));
  if (response.status === 404) {
    assert.match(body, /Page not found/);
    assert.match(body, /Return to the Senshac home page/);
  }
  console.log('preview: /no-such-route returns HTTP 404 with accessible branded output');
} finally {
  preview.kill('SIGTERM');
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await fetch('http://127.0.0.1:4321/');
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Astro preview server did not start');
}

console.log('preview: / renders the validated pinned export content in the built route');

async function readBuiltPage(name) {
  for (const directory of ['dist', 'public']) {
    try {
      return await readFile(new URL(`../${directory}/${name}`, import.meta.url), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`Built page not found: ${name}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
