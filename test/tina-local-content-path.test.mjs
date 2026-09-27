import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const packageJson = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const tinaToolchain = JSON.parse(
	readFileSync(new URL("../tools/tina/package.json", import.meta.url), "utf8"),
);

test("Tina scripts resolve the sibling checkout from tina/", () => {
	const siblingPath = "../../senshac-content/main";
	const webRoot = "/workspace/senshac-web";

	assert.equal(
		resolve(webRoot, "tina", siblingPath),
		resolve(webRoot, "..", "senshac-content", "main"),
	);
	for (const scriptName of ["dev:cms", "tina:generate", "build"]) {
		assert.match(packageJson.scripts[scriptName], /scripts\/tina-cli\.mjs/);
		assert.match(packageJson.scripts[scriptName], /TINA_LOCAL_CONTENT_PATH=\.\.\/\.\.\/senshac-content\/main/);
	}
});

test("Astro and Tina CLI use independent Vite toolchains", () => {
	assert.equal(packageJson.dependencies.vite, "^8.0.16");
	assert.equal(packageJson.overrides.vite, "^8.0.16");
	assert.equal(packageJson.overrides.esbuild, "^0.28.0");
	assert.equal(packageJson.devDependencies["@tinacms/cli"], undefined);
	assert.equal(tinaToolchain.dependencies["@tinacms/cli"], "3.0.0");
	assert.equal(tinaToolchain.dependencies.tinacms, packageJson.devDependencies.tinacms);
	assert.equal(tinaToolchain.overrides.tinacms, packageJson.devDependencies.tinacms);
});
