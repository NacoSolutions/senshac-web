import { readFile, writeFile } from "node:fs/promises";

const generatedConfigs = [
  "dist/server/wrangler.json",
  "dist/server/.prerender/wrangler.json",
];

for (const file of generatedConfigs) {
  try {
    const config = JSON.parse(await readFile(file, "utf8"));
    if (config.assets?.binding === "ASSETS") {
      config.assets.binding = "STATIC_ASSETS";
      await writeFile(file, `${JSON.stringify(config)}\n`);
      console.log(`Pages asset binding normalized: ${file}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
