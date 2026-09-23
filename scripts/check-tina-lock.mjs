import { readFile } from "node:fs/promises";

const lock = JSON.parse(await readFile("tina/tina-lock.json", "utf8"));
const collections = lock?.schema?.collections ?? [];
const paths = new Map(collections.map((collection) => [collection.name, collection.path]));
const expected = {
  siteConfig: "config",
  home: "pages",
  about: "pages",
  services: "pages",
  contact: "pages",
  legal: "legal",
  projects: "projects",
  translations: "translations",
};
const errors = [];
for (const [name, path] of Object.entries(expected)) {
  if (paths.get(name) !== path) errors.push(`${name}: expected ${path}, found ${paths.get(name) ?? "missing"}`);
}
for (const [name, path] of paths) {
  if (path.startsWith("src/content/")) errors.push(`${name}: legacy path ${path}`);
}
if (errors.length) {
  console.error("Tina schema lock is stale:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Tina schema lock OK (${collections.length} collections)`);
