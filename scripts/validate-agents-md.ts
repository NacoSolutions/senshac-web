import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const agentsPath = resolve(root, "AGENTS.md");
const agents = readFileSync(agentsPath, "utf8");

const requiredText = [
	"tr triage",
	"fx [-d <path>]",
	"dx [-d <path>]",
	"wt switch --create <kind>/<seed>-<slug> --base main",
	"docs/workspace-split-topology.md",
	"docs/workspace-seed-routing.md",
	"docs/workspace-agent-onboarding.md",
];

const missingText = requiredText.filter((value) => !agents.includes(value));
const requiredPaths = [
	"docs/workspace-split-topology.md",
	"docs/workspace-seed-routing.md",
	"docs/workspace-agent-onboarding.md",
	".envrc",
	".flox/env/manifest.toml",
	".config/wt.toml",
];
const missingPaths = requiredPaths.filter(
	(path) => !existsSync(resolve(root, path)),
);

if (missingText.length || missingPaths.length) {
	console.error("AGENTS.md drift detected.");
	if (missingText.length)
		console.error(`Missing required guidance: ${missingText.join(", ")}`);
	if (missingPaths.length)
		console.error(`Missing referenced paths: ${missingPaths.join(", ")}`);
	process.exit(1);
}

console.log("AGENTS.md validation passed.");
