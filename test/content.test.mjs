import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixture = JSON.parse(await readFile(new URL('../content/tina-fixture.json', import.meta.url)));
const schema = JSON.parse(await readFile(new URL('../content/tina-schema.json', import.meta.url)));

test('fixture satisfies the minimal Tina content contract', () => {
  assert.deepEqual(Object.keys(fixture), ['home']);
  assert.equal(typeof fixture.home.title, 'string');
  assert.equal(typeof fixture.home.intro, 'string');
  assert.deepEqual(schema.required, ['home']);
  assert.deepEqual(schema.properties.home.required, ['title', 'intro']);
});

test('fixture contains no credential-shaped fields', () => {
  assert.equal(JSON.stringify(fixture).match(/token|secret|password|credential/i), null);
});
