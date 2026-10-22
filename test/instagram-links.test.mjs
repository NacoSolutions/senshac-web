import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const instagram = await readFile(
	new URL("../src/components/sections/editorial/Instagram.astro", import.meta.url),
	"utf8",
);
const contentSchema = await readFile(
	new URL("../src/content.config.ts", import.meta.url),
	"utf8",
);
const tinaSchema = await readFile(
	new URL("../tina/config.ts", import.meta.url),
	"utf8",
);

test("Instagram feed links can be disabled per block without changing the default", () => {
	assert.match(instagram, /disableLinks\?: boolean/);
	assert.match(instagram, /disableLinks = false/);
	assert.equal((instagram.match(/\{!disableLinks && \(/g) ?? []).length, 2);
	assert.match(
		contentSchema,
		/feed: \["title", "description", "tag", "limit", "maxVisible", "disableLinks"\]/,
	);
	assert.match(
		tinaSchema,
		/name: "disableLinks",\s+label: "Disable Instagram Links",\s+type: "boolean"/,
	);
	assert.match(contentSchema, /feed disableLinks must be a boolean/);
});
