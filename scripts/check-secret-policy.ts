import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

const root = new URL("..", import.meta.url).pathname;

function runGit(args: string[]): string {
	const result = Bun.spawnSync(["git", ...args], { cwd: root });
	if (result.exitCode !== 0) {
		throw new Error(new TextDecoder().decode(result.stderr));
	}
	return new TextDecoder().decode(result.stdout);
}

function listRepositoryFiles(): string[] {
	const output = runGit([
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"-z",
	]);
	return output.split("\0").filter(Boolean);
}

const blockedExact = new Set([
	".env",
	".env.local",
	".env.pages",
	".env.development",
	".env.production",
	".secrets",
	".secrets.act",
	".sops-age-key.txt",
]);

const requiredGitignorePatterns = [
	"secrets/**/*.dec.env",
	"secrets/**/*.plain.env",
	"secrets/**/*.local.env",
	"secrets/**/*.key",
	"secrets/**/*.pem",
	".sops-age-key.txt",
	"*.agekey",
];

function isBlockedEnv(path: string): boolean {
	if (blockedExact.has(path)) return true;
	if (/^\.env\..+\.local$/.test(path)) return true;
	return false;
}

function isUnsafeSecretsFile(path: string): boolean {
	if (!path.startsWith("secrets/")) return false;
	const name = basename(path);
	if (name === "README.md") return false;
	if (name.includes(".enc.")) return false;
	return /\.(env|json|ya?ml|toml|key|pem|txt)$/.test(name);
}

function main() {
	const failures: string[] = [];
	for (const path of listRepositoryFiles()) {
		if (isBlockedEnv(path)) {
			failures.push(`${path} is a plaintext secret file and must stay ignored`);
		}
		if (isUnsafeSecretsFile(path)) {
			failures.push(
				`${path} is under secrets/ but is not an encrypted .enc. bundle`,
			);
		}
	}

	const gitignorePath = `${root}/.gitignore`;
	const gitignore = existsSync(gitignorePath)
		? readFileSync(gitignorePath, "utf8")
		: "";
	for (const pattern of requiredGitignorePatterns) {
		if (!gitignore.split(/\r?\n/).includes(pattern)) {
			failures.push(`.gitignore must include ${pattern}`);
		}
	}

	if (failures.length > 0) {
		console.error("Secret policy check failed:");
		for (const failure of failures) {
			console.error(`- ${failure}`);
		}
		process.exit(1);
	}
}

main();
