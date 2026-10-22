import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const [contentSchema, tinaSchema, rows] = await Promise.all([
	readFile(new URL("../src/content.config.ts", import.meta.url), "utf8"),
	readFile(new URL("../tina/config.ts", import.meta.url), "utf8"),
	readFile(
		new URL("../src/components/sections/editorial/Rows.astro", import.meta.url),
		"utf8",
	),
]);

test("phase-scroll remains an editable generic list variant", () => {
	assert.match(contentSchema, /list: \[[^\]]*"variant"[^\]]*"mediaId"/);
	assert.match(contentSchema, /"number", "title", "text", "href", "ctaText"/);
	assert.match(tinaSchema, /name: "variant"[\s\S]*?options: \["default", "phase-scroll"\]/);
	assert.match(tinaSchema, /name: "number", label: "Number", type: "string"/);
});

test("phase-scroll renders an accessible horizontal image-and-card rail", () => {
	assert.match(rows, /variant === "phase-scroll"/);
	assert.match(rows, /MediaPlaceholder/);
	assert.match(rows, /data-phase-track/);
	assert.match(rows, /role="region"/);
	assert.match(rows, /aria-label=\{nextSlideLabel\}/);
	assert.match(rows, /tinaField\(tinaData\.items\[index\], "number"\)/);
});
