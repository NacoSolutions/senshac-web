import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const hero = await read("../src/components/sections/editorial/Hero.astro");
const home = await read("../src/pages/[lang]/index.astro");

test("Home hero CTA uses editorial-link SVG arrow without hiding ::after", () => {
  assert.match(hero, /class="editorial-link home-hero__cta"/);
  assert.doesNotMatch(hero, /\.home-hero__cta::after\s*\{\s*display:\s*none;/);
});

test("Home process copy starts at the shared rail without an auto left margin", () => {
  assert.match(
    home,
    /\.home-page > \[data-block-template="list"\] \.editorial-phase-scroll__copy \{[^}]*margin-left: 0;/s,
  );
});
