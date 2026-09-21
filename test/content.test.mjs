import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertHomeContent } from '../src/content/contract.mjs';
import { adaptContentExport, PINNED_SOURCE_REVISION } from '../src/content/adapter.mjs';

const fixture = JSON.parse(await readFile(new URL('../content/tina-fixture.json', import.meta.url)));
const schema = JSON.parse(await readFile(new URL('../content/tina-schema.json', import.meta.url)));
const routeSource = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const projectRouteSource = await readFile(new URL('../src/pages/projects/index.astro', import.meta.url), 'utf8');
const detailRouteSource = await readFile(new URL('../src/pages/projects/[slug].astro', import.meta.url), 'utf8');

test('fixture satisfies the minimal Tina content contract', () => {
  assert.deepEqual(Object.keys(fixture), ['home']);
  assert.deepEqual(assertHomeContent(fixture), fixture.home);
  assert.deepEqual(schema.required, ['home']);
  assert.deepEqual(schema.properties.home.required, ['title', 'intro']);
});

test('representative route consumes the pinned export through the adapter', () => {
  assert.match(routeSource, /import \{ adaptContentExport \} from ['"]\.\.\/content\/adapter\.mjs['"]/);
  assert.match(routeSource, /import pinnedExport from ['"]\.\.\/\.\.\/content\/senshac-content-export\.json['"]/);
  assert.match(routeSource, /adaptContentExport\(pinnedExport\)/);
  assert.doesNotMatch(routeSource, /process\.env|fetch\(/);
});

test('migrated project index is exposed through the content adapter and routes', async () => {
  const result = adaptContentExport(JSON.parse(await readFile(new URL('../content/senshac-content-export.json', import.meta.url))));
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.projects.map(({ slug }) => slug), ['la-trobada', 'casa-m']);
  assert.match(projectRouteSource, /result\.projects/);
  assert.match(detailRouteSource, /getStaticPaths/);
  assert.match(detailRouteSource, /project\.slug/);
});

test('pinned adapter exposes ready, stale, missing, and error outcomes', () => {
  const ready = adaptContentExport({
    contractVersion: 1,
    sourceRevision: PINNED_SOURCE_REVISION,
    content: fixture,
  });
  assert.equal(ready.status, 'ready');
  assert.deepEqual(ready.content, fixture.home);
  assert.equal(adaptContentExport(null).status, 'missing');
  assert.equal(adaptContentExport({ contractVersion: 1, sourceRevision: 'other', content: fixture }).status, 'stale');
  assert.equal(adaptContentExport({ contractVersion: 99, sourceRevision: PINNED_SOURCE_REVISION, content: fixture }).status, 'stale');
  assert.equal(adaptContentExport({ contractVersion: 1, sourceRevision: PINNED_SOURCE_REVISION, content: {} }).status, 'error');
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
