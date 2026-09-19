import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertHomeContent } from '../src/content/contract.mjs';

const fixture = JSON.parse(await readFile(new URL('../content/tina-fixture.json', import.meta.url)));
const schema = JSON.parse(await readFile(new URL('../content/tina-schema.json', import.meta.url)));
const routeSource = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('fixture satisfies the minimal Tina content contract', () => {
  assert.deepEqual(Object.keys(fixture), ['home']);
  assert.deepEqual(assertHomeContent(fixture), fixture.home);
  assert.deepEqual(schema.required, ['home']);
  assert.deepEqual(schema.properties.home.required, ['title', 'intro']);
});

test('representative route consumes the fixture through the content contract', () => {
  assert.match(routeSource, /import \{ assertHomeContent \} from ['"]\.\.\/content\/contract\.mjs['"]/);
  assert.match(routeSource, /import fixture from ['"]\.\.\/\.\.\/content\/tina-fixture\.json['"]/);
  assert.match(routeSource, /assertHomeContent\(fixture\)/);
  assert.doesNotMatch(routeSource, /process\.env|fetch\(/);
});

test('contract rejects malformed sibling content exports', () => {
  assert.throws(() => assertHomeContent({}), /home object/);
  assert.throws(() => assertHomeContent({ home: { title: '', intro: 'Valid' } }), /non-empty/);
  assert.throws(() => assertHomeContent({ home: { title: 'Valid', intro: 'Valid', slug: 'extra' } }), /unsupported/);
  assert.throws(() => assertHomeContent({ home: { title: 'Valid', intro: 'Valid' }, posts: [] }), /unsupported/);
});

test('fixture contains no credential-shaped fields', () => {
  assert.equal(JSON.stringify(fixture).match(/token|secret|password|credential/i), null);
});
