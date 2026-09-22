import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const revision = process.env.SENSHAC_CONTENT_REVISION ??
	"15f21c5c90e7da599132d3bd4a5bfeec14aab24b";
const targetRoot = resolve("src/content");
const siblingRoot = resolve("../../senshac-content/main");
const temporaryRoot = await mkdtemp("/tmp/senshac-content-");

try {
	let sourceRoot = siblingRoot;
	try {
		await exec("git", ["-C", siblingRoot, "cat-file", "-e", `${revision}^{commit}`]);
	} catch {
		sourceRoot = join(temporaryRoot, "source");
		await exec("mkdir", ["-p", sourceRoot]);
		const archive = join(temporaryRoot, "content.tar.gz");
		const response = await fetch(
			`https://github.com/NacoSolutions/senshac-content/archive/${revision}.tar.gz`,
		);
		if (!response.ok) throw new Error(`Unable to fetch senshac-content: ${response.status}`);
		await writeFile(archive, Buffer.from(await response.arrayBuffer()));
		await exec("tar", ["-xzf", archive, "--strip-components=1", "-C", sourceRoot]);
	}

	for (const directory of ["config", "pages", "legal", "projects", "translations"]) {
		const source = join(sourceRoot, directory);
		const target = join(targetRoot, directory);
		await rm(target, { recursive: true, force: true });
		await cp(source, target, { recursive: true });
		await writeFile(join(target, ".gitkeep"), "");
	}

	console.log(`Editorial content synced from senshac-content ${revision}`);
} finally {
	await rm(temporaryRoot, { recursive: true, force: true });
}
