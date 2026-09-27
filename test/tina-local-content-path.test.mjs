import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";

const packageJson = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

test("Tina scripts resolve the sibling checkout from tina/", () => {
	const siblingPath = "../../senshac-content/main";
	const webRoot = "/workspace/senshac-web";

	assert.equal(
		resolve(webRoot, "tina", siblingPath),
		resolve(webRoot, "..", "senshac-content", "main"),
	);
	for (const scriptName of ["dev:cms", "tina:generate", "build"]) {
		assert.match(packageJson.scripts[scriptName], /\[ -d \.\.\/senshac-content\/main \]/);
		assert.match(packageJson.scripts[scriptName], /TINA_LOCAL_CONTENT_PATH=\.\.\/\.\.\/senshac-content\/main/);
	}
});

test("Tina's own Vite and esbuild versions stay within its declared ranges", () => {
	const require = createRequire(import.meta.url);
	const tinaCliRequire = createRequire(require.resolve("@tinacms/cli/package.json"));
	const tinaVitePath = tinaCliRequire.resolve("vite/package.json");
	const tinaVite = JSON.parse(readFileSync(tinaVitePath, "utf8"));
	const tinaViteRequire = createRequire(tinaVitePath);
	const tinaEsbuild = JSON.parse(
		readFileSync(tinaViteRequire.resolve("esbuild/package.json"), "utf8"),
	);

	assert.match(tinaVite.version, /^6\./);
	assert.match(tinaEsbuild.version, /^0\.25\./);
});
