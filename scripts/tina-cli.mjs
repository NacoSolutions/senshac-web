import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toolchain = resolve(root, "tools/tina");

function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}

run("bun", ["install", "--frozen-lockfile"], toolchain);

const cliManifestPath = resolve(toolchain, "node_modules/@tinacms/cli/package.json");
const cliRequire = createRequire(cliManifestPath);
const viteManifest = JSON.parse(
	readFileSync(cliRequire.resolve("vite/package.json"), "utf8"),
);
if (!viteManifest.version.startsWith("6.")) {
	throw new Error(`Tina CLI must use its isolated Vite 6 toolchain; found ${viteManifest.version}`);
}

const cli = resolve(toolchain, "node_modules/.bin/tinacms");
const args = process.argv.slice(2);
if (!args.some((arg) => ["--help", "-h", "--version", "-v"].includes(arg))) {
	args.push("--rootPath", root);
}
run(cli, args, root);
