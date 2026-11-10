import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rows = await readFile(
	new URL("../src/components/sections/editorial/Rows.astro", import.meta.url),
	"utf8",
);

test("inquiry fallback has no horizontal rules", () => {
	const fallback = rows.match(/\.editorial-inquiry-flows article:last-child\s*\{([^}]+)\}/s)?.[1];
	const lastPrimary = rows.match(/\.editorial-inquiry-flows article:nth-last-child\(2\)\s*\{([^}]+)\}/s)?.[1];
	assert.ok(fallback, "fallback styling exists");
	assert.ok(lastPrimary, "last primary choice styling exists");
	assert.doesNotMatch(fallback, /border-top:\s*1px/);
	assert.match(fallback, /border-bottom:\s*0/);
	assert.match(lastPrimary, /border-bottom:\s*0/);
});
