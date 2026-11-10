import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const hero = await read("../src/components/sections/editorial/Hero.astro");
const home = await read("../src/pages/[lang]/index.astro");

test("Home hero CTA renders a visible northeast arrow glyph", () => {
  assert.match(hero, /class="home-hero__cta-arrow"[^>]*>↗<\/span>/);
});

test("Home process copy starts at the shared rail without an auto left margin", () => {
  assert.match(
    home,
    /\.home-page > \[data-block-template="list"\] \.editorial-phase-scroll__copy \{[^}]*margin-left: 0;/s,
  );
});
