import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const instagram = await readFile(new URL("../src/components/sections/editorial/Instagram.astro", import.meta.url), "utf8");
const renderer = await readFile(new URL("../src/components/BlocksRenderer.astro", import.meta.url), "utf8");
test("three available Instagram posts stay in a three-column row", () => {
  assert.ok(instagram.includes("grid-cols-3"));
  assert.ok(instagram.includes("instagram-feed__item"));
  assert.match(instagram, /\.instagram-feed__track--carousel > \.instagram-feed__item \{[^}]*width: var\(--desktop-w\);/s);
});

test("Instagram carousel shows three posts and has matching conditional controls", () => {
  assert.ok(renderer.includes("<EditorialInstagram {...block} tinaData={block} maxVisible={3} />"));
  assert.ok(instagram.includes("displayPosts.length > maxVisible"));
  assert.ok(instagram.includes("instagram-carousel__controls"));
  assert.ok(instagram.includes("aria-label={previousSlideLabel}"));
  assert.ok(instagram.includes("aria-label={nextSlideLabel}"));
});
