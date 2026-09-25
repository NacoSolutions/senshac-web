import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const agentsPath = resolve(root, "AGENTS.md");
const agents = readFileSync(agentsPath, "utf8");

const requiredText = [
	"senshac-agent-principles",
	"dependency-hygiene",
	"verification-before-completion",
];

const missingText = requiredText.filter((value) => !agents.includes(value));
const requiredPaths = ["devenv.nix", "package.json", "bun.lock"];
const missingPaths = requiredPaths.filter(
	(path) => !existsSync(resolve(root, path)),
);

if (missingText.length || missingPaths.length) {
	console.error("AGENTS.md or environment contract drift detected.");
	if (missingText.length)
		console.error(`Missing required guidance: ${missingText.join(", ")}`);
	if (missingPaths.length)
		console.error(`Missing required paths: ${missingPaths.join(", ")}`);
	process.exit(1);
}

console.log("AGENTS.md and devenv contract validation passed.");
