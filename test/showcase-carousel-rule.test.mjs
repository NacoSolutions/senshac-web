import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const showcase = await readFile(
	new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url),
	"utf8",
);

test("project carousel keeps the white rule inset within each slide", () => {
	assert.ok(showcase.includes("border-top: 1px solid #fff"));
	assert.ok(showcase.includes("inset: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) auto"));
});
