import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertHomeContent } from '../src/content/contract.mjs';

const fixture = JSON.parse(await readFile(new URL('../content/tina-fixture.json', import.meta.url)));
const schema = JSON.parse(await readFile(new URL('../content/tina-schema.json', import.meta.url)));

test('fixture satisfies the minimal Tina content contract', () => {
  assert.deepEqual(Object.keys(fixture), ['home']);
  assert.deepEqual(assertHomeContent(fixture), fixture.home);
  assert.deepEqual(schema.required, ['home']);
  assert.deepEqual(schema.properties.home.required, ['title', 'intro']);
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
