import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(
	new URL("../src/pages/tina-island/[name].ts", import.meta.url),
	"utf8",
);
const registry = await readFile(
	new URL("../src/lib/tina-islands.ts", import.meta.url),
	"utf8",
);

test("Tina island route delegates to the experimental authenticated handler", () => {
	assert.match(route, /experimental_createIslandRoute/);
	assert.match(route, /createIslands\(\)/);
	assert.match(route, /export const ALL/);
	assert.doesNotMatch(route, /status:\s*404/);
});

test("the island registry retains page and global chrome islands", () => {
	for (const name of [
		"home",
		"about",
		"services",
		"project",
		"header",
		"footer",
		"contact",
		"legal",
	]) {
		assert.match(registry, new RegExp(`\\n\\t\\t${name}: \\{`));
	}
	assert.match(registry, /params\.get\("relativePath"\)/);
	assert.match(registry, /params\?\.get\("lang"\)/);
});
