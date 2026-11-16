import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tinaConfig = await readFile(
  new URL("../tina/config.ts", import.meta.url),
  "utf8",
);
const collectionsStart = tinaConfig.indexOf("collections: [");
assert.notEqual(collectionsStart, -1, "Tina collections are declared");
const collections = tinaConfig.slice(collectionsStart);
const sidebarCollections = [...collections.matchAll(
  /name: "(siteConfig|home|about|services|contact|legal|projects|translations)",\s*label: "([^"]+)"/g,
)].map(([, name, label]) => ({ name, label }));

test("Tina sidebar collections are grouped and ordered for editors", () => {
  assert.deepEqual(sidebarCollections, [
    { name: "home", label: "Pages · Home" },
    { name: "about", label: "Pages · Studio" },
    { name: "services", label: "Pages · Methods" },
    { name: "contact", label: "Pages · Contact" },
    { name: "legal", label: "Pages · Legal" },
    { name: "projects", label: "Portfolio · Projects" },
    { name: "siteConfig", label: "Site Settings" },
    { name: "translations", label: "Translations" },
  ]);
});

test("Tina sidebar reorganization preserves global settings collections", () => {
  assert.match(collections, /name: "siteConfig"[\s\S]*?global: true/);
  assert.match(collections, /name: "translations"[\s\S]*?global: true/);
});
