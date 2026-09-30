import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const requestedRevision = process.env.SENSHAC_CONTENT_REVISION;
const targetRoot = resolve("src/content");
const siblingRoot = resolve(
	process.env.SENSHAC_CONTENT_PATH ?? "../../senshac-content/main",
);
const temporaryRoot = await mkdtemp("/tmp/senshac-content-");

try {
	let revision = requestedRevision;
	if (!revision) {
		try {
			const result = await exec("git", ["-C", siblingRoot, "rev-parse", "HEAD"]);
			revision = result.stdout.trim();
		} catch {
			let apiError;
			try {
				const response = await fetch(
					"https://api.github.com/repos/NacoSolutions/senshac-content/commits/main",
					{ headers: { accept: "application/vnd.github+json" } },
				);
				if (!response.ok) {
					throw new Error(`GitHub API returned ${response.status}`);
				}
				const result = await response.json();
				revision = result.sha;
			} catch (error) {
				apiError = error;
				try {
					const result = await exec("git", [
						"ls-remote",
						"https://github.com/NacoSolutions/senshac-content.git",
						"refs/heads/main",
					]);
					revision = result.stdout.trim().split(/\s+/)[0];
					if (!revision) throw new Error("git ls-remote returned no main revision");
					console.warn(`GitHub API unavailable; resolved senshac-content main via git ls-remote (${apiError.message})`);
				} catch (gitError) {
					throw new AggregateError(
						[apiError, gitError],
						"Unable to resolve senshac-content main via GitHub API or git ls-remote",
					);
				}
			}
		}
	}
	if (!/^[0-9a-f]{40}$/.test(revision)) {
		throw new Error(`Invalid senshac-content revision: ${revision}`);
	}

	const sourceRoot = join(temporaryRoot, "source");
	let hasLocalRevision = true;
	try {
		await exec("git", ["-C", siblingRoot, "cat-file", "-e", `${revision}^{commit}`]);
	} catch {
		hasLocalRevision = false;
	}
	await exec("mkdir", ["-p", sourceRoot]);
	if (hasLocalRevision) {
		const archive = await exec("git", ["-C", siblingRoot, "archive", "--format=tar", revision], {
			encoding: "buffer",
		});
		const archivePath = join(temporaryRoot, "content.tar");
		await writeFile(archivePath, archive.stdout);
		await exec("tar", ["-xf", archivePath, "-C", sourceRoot]);
	} else {
		const archivePath = join(temporaryRoot, "content.tar.gz");
		const response = await fetch(
			`https://github.com/NacoSolutions/senshac-content/archive/${revision}.tar.gz`,
		);
		if (!response.ok) {
			throw new Error(`Unable to fetch senshac-content@${revision}: ${response.status}`);
		}
		await writeFile(archivePath, Buffer.from(await response.arrayBuffer()));
		await exec("tar", ["-xzf", archivePath, "--strip-components=1", "-C", sourceRoot]);
	}

	for (const directory of ["config", "pages", "legal", "projects", "translations"]) {
		const source = join(sourceRoot, directory);
		const target = join(targetRoot, directory);
		await rm(target, { recursive: true, force: true });
		await cp(source, target, { recursive: true });
		await writeFile(join(target, ".gitkeep"), "");
	}

	console.log(`Editorial content synced from senshac-content@${revision}`);
} finally {
	await rm(temporaryRoot, { recursive: true, force: true });
}
