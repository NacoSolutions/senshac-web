import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";

const rows = await readFile(new URL("../src/components/sections/editorial/Rows.astro", import.meta.url), "utf8");

test("primary inquiry links share a group, fallback has its own style hook", () => {
  expect(rows).toMatch(/editorial-inquiry-primary/);
  expect(rows).toMatch(/editorial-inquiry-fallback/);
});
