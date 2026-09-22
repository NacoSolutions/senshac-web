import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PREVIEW_CONTENT_TYPE } from "@tinacms/bridge/preview";
import { experimental_createIslandRoute } from "@tinacms/astro/experimental";

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

test("the island route uses Tina's authenticated preview request contract", async () => {
	const handler = experimental_createIslandRoute({});
	const url = new URL("http://localhost/tina-island/header");

	assert.equal((await handler({ params: { name: "header" }, request: new Request(url), url })).status, 405);
	assert.equal(
		(await handler({
			params: { name: "header" },
			request: new Request(url, {
				method: "POST",
				headers: { "content-type": "application/json" },
			}),
			url,
		})).status,
		404,
	);
	// A Tina preview POST passes the method/content-type gate; the empty registry
	// then rejects the island name, proving this is not a plain GET endpoint.
	assert.equal(
		(await handler({
			params: { name: "header" },
			request: new Request(url, {
				method: "POST",
				headers: { "content-type": PREVIEW_CONTENT_TYPE },
			}),
			url,
		})).status,
		404,
	);
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
