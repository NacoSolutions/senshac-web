import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const showcase = await readFile(
	new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url),
	"utf8",
);

test("showcase item placeholders remain non-linked and linked items retain their routes", () => {
	assert.doesNotMatch(showcase, /href=\{item\.link\s*\|\|\s*['"]#['"]\}/);
	assert.match(showcase, /item\.link\s*\?/);
	assert.match(showcase, /href=\{item\.link\}/);
	assert.match(showcase, /label=\{item\.placeholderLabel\}/);
});

test("project showcases cap content and use responsive multi-card scroll snapping", () => {
	assert.match(showcase, /limit\?: number/);
	assert.match(showcase, /maxVisible\?: number/);
	assert.match(showcase, /sorted\.slice\(0,\s*limit\s*\?\?\s*sorted\.length\)/);
	assert.match(showcase, /data-project-carousel/);
	assert.match(showcase, /data-visible-items=\{visibleProjectCount\}/);
	assert.match(showcase, /scroll-snap-type:\s*x mandatory/);
	assert.match(showcase, /scroll-snap-stop:\s*always/);
	assert.match(showcase, /slide\.category/);
	assert.match(showcase, /<h3[^>]*>\{slide\.title\}<\/h3>/);
	assert.doesNotMatch(showcase, /x-data="carousel"/);
});
