import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const showcase = await readFile(new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url), "utf8");
const home = await readFile(new URL("../src/pages/[lang]/index.astro", import.meta.url), "utf8");
test("image carousel header has inset side margins and an inset top rule", () => {
  assert.ok(showcase.includes("border-top: 1px solid #fff"));
  assert.ok(showcase.includes("inset: clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) auto"));
});
test("RUDE two-image feature fills its split and overlays the right-side label", () => {
  assert.ok(home.includes("rude-feature"));
  assert.ok(showcase.includes("rude-feature__media"));
  assert.ok(showcase.includes("rude-feature__overlay"));
});
