import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const showcase = await readFile(new URL("../src/components/sections/editorial/Showcase.astro", import.meta.url), "utf8");
const home = await readFile(new URL("../src/pages/[lang]/index.astro", import.meta.url), "utf8");
test("carousel keeps the smoke behind an inset header with a bottom rule", () => {
  const smoke = showcase.match(/\.showcase-project-carousel__slide::before\s*\{([^}]+)\}/s)?.[1];
  const header = showcase.match(/\.showcase-project-carousel__overlay\s*\{([^}]+)\}/s)?.[1];
  assert.ok(smoke?.includes("background: linear-gradient"));
  assert.ok(header?.includes("border-bottom: 1px solid #fff"));
  assert.ok(header?.includes("background: transparent"));
  assert.ok(!header?.includes("border-top"));
});
test("RUDE two-image feature fills its split and overlays the right-side label", () => {
  assert.ok(home.includes("rude-feature"));
  assert.ok(showcase.includes("rude-feature__media"));
  assert.ok(showcase.includes("rude-feature__overlay"));
});
