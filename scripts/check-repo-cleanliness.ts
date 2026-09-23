#!/usr/bin/env bun
/**
 * Repository cleanliness guard.
 *
 * Verifies that the current git working tree is completely clean (no untracked
 * files, no uncommitted modifications). This is primarily used as the final step
 * in the `check:all` CI gate to ensure that auto-generators, agents, or build
 * scripts do not leave behind mutated files, `test.txt` pollution, or empty
 * directories.
 */

import { spawnSync } from "node:child_process";

export function statusViolations(output: string, allowStaged: boolean) {
	return output
		.split("\n")
		.filter((line) => line.length > 0)
		.filter((line) => {
			if (!allowStaged) return true;
			if (line.startsWith("??")) return true;

			const worktreeStatus = line[1];
			return worktreeStatus !== " ";
		});
}

function main() {
	// 1. Check for untracked or modified files using git status
	const status = spawnSync("git", ["status", "--porcelain"], {
		encoding: "utf8",
	});

	if (status.error) {
		console.error("Failed to run git status. Is git installed?");
		process.exit(1);
	}

	const allowStaged = process.env.CHECK_CLEAN_ALLOW_STAGED === "1";
	const lines = statusViolations(status.stdout, allowStaged);

	if (lines.length > 0) {
		console.error("❌ check-repo-cleanliness: The working tree is not clean!");
		console.error(
			"Agents, build scripts, or auto-generators have left behind untracked files or modifications:\n",
		);

		for (const line of lines) {
			console.error(`  ${line}`);
		}

		console.error(
			"\nPlease commit these changes, add them to .gitignore, or delete them (if they are agent pollution like test.txt).",
		);
		process.exit(1);
	}

	// 2. Check for empty directories (git ignores them, but they pollute the tree)
	const find = spawnSync(
		"find",
		[
			".",
			"-type",
			"d",
			"-empty",
			"-not",
			"-path",
			"./.git/*",
			"-not",
			"-path",
			"./node_modules/*",
			"-not",
			"-path",
			"./.wrangler/*",
			"-not",
			"-path",
			"./.astro/*",
			"-not",
			"-path",
			"./tina/__generated__/.cache*",
		],
		{ encoding: "utf8" },
	);
	if (find.error || find.status !== 0) {
		console.error("Failed to scan the repository for empty directories.");
		if (find.error) console.error(find.error.message);
		if (find.stderr) console.error(find.stderr.trim());
		process.exit(1);
	}

	const emptyDirs = (find.stdout || "")
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length > 0 && l !== ".");

	if (emptyDirs.length > 0) {
		console.error(
			"❌ check-repo-cleanliness: Found empty directories polluting the repository:\n",
		);
		for (const dir of emptyDirs) {
			console.error(`  ${dir}`);
		}
		console.error("\nPlease delete these directories.");
		process.exit(1);
	}

	console.log(
		allowStaged
			? "✓ check-repo-cleanliness: No unstaged or untracked agent pollution detected."
			: "✓ check-repo-cleanliness: Working tree is clean. No agent pollution detected.",
	);
}

if (import.meta.main) main();
