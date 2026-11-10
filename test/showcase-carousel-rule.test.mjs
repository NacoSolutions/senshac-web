import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const showcase = await readFile(
	new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url),
	"utf8",
);

test("carousel smoke is separate from the inset header and its white rule is below", () => {
	const slideSmoke = showcase.match(/\.showcase-project-carousel__slide::before\s*\{([^}]+)\}/s)?.[1];
	const header = showcase.match(/\.showcase-project-carousel__overlay\s*\{([^}]+)\}/s)?.[1];
	assert.ok(slideSmoke?.includes("background: linear-gradient"));
	assert.ok(slideSmoke?.includes("inset: 0 0 auto"));
	assert.ok(header?.includes("border-bottom: 1px solid #fff"));
	assert.ok(header?.includes("background: transparent"));
	assert.ok(!header?.includes("border-top"));
	assert.ok(header?.includes("inset: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) auto"));
});
