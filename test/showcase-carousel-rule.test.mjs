import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const showcase = await readFile(
	new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url),
	"utf8",
);

test("project carousel keeps the white rule inset within each slide", () => {
	assert.match(showcase, /\.showcase-project-carousel__overlay\s*\{[^}]*border-bottom:\s*1px solid #fff/s);
	assert.match(showcase, /\.showcase-project-carousel__overlay\s*\{[^}]*padding:\s*1rem 0 0\.75rem clamp\(1rem,\s*3vw,\s*2rem\)/s);
});
