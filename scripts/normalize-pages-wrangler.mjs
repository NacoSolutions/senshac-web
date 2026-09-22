import { readFile, writeFile } from "node:fs/promises";

const generatedConfigs = [
  "dist/server/wrangler.json",
  "dist/server/.prerender/wrangler.json",
];

for (const file of generatedConfigs) {
  try {
    const config = JSON.parse(await readFile(file, "utf8"));
    if (config.pages_build_output_dir) {
      // Pages owns the runtime entrypoint and asset binding. These Worker-only
      // fields make the generated config invalid for a Pages deployment.
      delete config.main;
      delete config.rules;
      delete config.assets;
      await writeFile(file, `${JSON.stringify(config)}\n`);
      console.log(`Pages config normalized: ${file}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
