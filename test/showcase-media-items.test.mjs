import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const showcase = await readFile(
	new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url),
	"utf8",
);

test("media-only showcase items retain fallbacks without empty hash links or titles", () => {
	assert.doesNotMatch(showcase, /href=\{item\.link\s*\|\|\s*['"]#['"]\}/);
	assert.match(showcase, /href=\{item\.link\}/);
	assert.match(showcase, /\{item\.title\s*&&/);
	assert.match(showcase, /label=\{item\.placeholderLabel\}/);
});
