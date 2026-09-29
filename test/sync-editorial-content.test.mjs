import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const execFile = promisify(execFileCallback);
const scriptPath = resolve("scripts/sync-editorial-content.mjs");
const contentDirectories = ["config", "pages", "legal", "projects", "translations"];

async function setupContentRepository(root) {
	await mkdir(root, { recursive: true });
	await execFile("git", ["init", "--quiet", root]);
	await execFile("git", ["-C", root, "config", "user.name", "Content Test"]);
	await execFile("git", ["-C", root, "config", "user.email", "content-test@example.invalid"]);
	for (const directory of contentDirectories) {
		await mkdir(join(root, directory), { recursive: true });
		await writeFile(join(root, directory, ".gitkeep"), "");
	}
	await mkdir(join(root, "pages/es"), { recursive: true });
	const homePage = join(root, "pages/es/home.json");
	await writeFile(homePage, JSON.stringify({ intro: "first revision" }));
	await execFile("git", ["-C", root, "add", "."]);
	await execFile("git", ["-C", root, "commit", "--quiet", "-m", "first content revision"]);
	const { stdout: firstRevision } = await execFile("git", ["-C", root, "rev-parse", "HEAD"]);
	await writeFile(homePage, JSON.stringify({ intro: "second revision" }));
	await execFile("git", ["-C", root, "add", "."]);
	await execFile("git", ["-C", root, "commit", "--quiet", "-m", "second content revision"]);
	const { stdout: secondRevision } = await execFile("git", ["-C", root, "rev-parse", "HEAD"]);
	return { firstRevision: firstRevision.trim(), secondRevision: secondRevision.trim() };
}

async function runSync(projectRoot, contentRoot, revision) {
	await mkdir(join(projectRoot, "src/content"), { recursive: true });
	const env = { ...process.env, SENSHAC_CONTENT_PATH: contentRoot };
	if (revision) env.SENSHAC_CONTENT_REVISION = revision;
	else delete env.SENSHAC_CONTENT_REVISION;
	return execFile(process.execPath, [scriptPath], { cwd: projectRoot, env });
}

test("syncs the sibling content checkout HEAD and records its immutable SHA", async () => {
	const root = await mkdtemp(join(tmpdir(), "senshac-content-sync-"));
	try {
		const contentRoot = join(root, "content");
		const projectRoot = join(root, "web");
		const { secondRevision } = await setupContentRepository(contentRoot);
		const { stdout } = await runSync(projectRoot, contentRoot);
		const copied = await readFile(join(projectRoot, "src/content/pages/es/home.json"), "utf8");
		assert.deepEqual(JSON.parse(copied), { intro: "second revision" });
		assert.match(stdout, new RegExp(`senshac-content@${secondRevision}`));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("syncs the requested immutable SHA rather than the sibling checkout HEAD", async () => {
	const root = await mkdtemp(join(tmpdir(), "senshac-content-sync-"));
	try {
		const contentRoot = join(root, "content");
		const projectRoot = join(root, "web");
		const { firstRevision } = await setupContentRepository(contentRoot);
		const { stdout } = await runSync(projectRoot, contentRoot, firstRevision);
		const copied = await readFile(join(projectRoot, "src/content/pages/es/home.json"), "utf8");
		assert.deepEqual(JSON.parse(copied), { intro: "first revision" });
		assert.match(stdout, new RegExp(`senshac-content@${firstRevision}`));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
