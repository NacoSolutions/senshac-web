import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const showcase = await readFile(new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url), "utf8");
const home = await readFile(new URL("../src/pages/[lang]/index.astro", import.meta.url), "utf8");
test("carousel header has a bottom rule and no smoke gradient", () => {
  const header = showcase.match(/\.showcase-project-carousel__overlay\s*\{([^}]+)\}/s)?.[1];
  assert.ok(!showcase.includes(".showcase-project-carousel__slide::before"));
  assert.ok(!showcase.includes("linear-gradient"));
  assert.ok(header?.includes("border-bottom: 1px solid #fff"));
  assert.ok(header?.includes("background: transparent"));
});
test("RUDE two-image feature fills its split and overlays the right-side label", () => {
  assert.ok(home.includes("rude-feature"));
  assert.ok(showcase.includes("rude-feature__media"));
  assert.ok(showcase.includes("rude-feature__overlay"));
});
