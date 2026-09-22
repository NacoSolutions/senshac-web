import { access, readdir, readFile, unlink, writeFile } from "node:fs/promises";

const roots = process.argv.slice(2).map((root) => `${root}/admin`);
if (roots.length === 0) roots.push("public/admin");
const removed = [];

async function removeBrowserStubs(directory) {
	try {
		await access(directory);
	} catch {
		return;
	}
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) {
			await removeBrowserStubs(path);
		} else if (entry.name.startsWith("__vite-browser-external_")) {
			removed.push(entry.name);
			await unlink(path);
		}
	}
}

async function assertNoBrokenReferences(directory) {
	try {
		await access(directory);
	} catch {
		return;
	}
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) {
			await assertNoBrokenReferences(path);
			continue;
		}
		let source = await readFile(path, "utf8");
		// Tina's bundle can inline Vite's empty-module stub (notably for
		// node:util). Its throwing getter crashes when util.inspect reads .custom;
		// the browser-safe value is simply absent, as intended by the fallback.
		const repaired = source.replace(
			/throw Error\(`Module "" has been externalized for browser compatibility\.[\s\S]*?more details\.`\)/g,
			"return",
		);
		if (repaired !== source) {
			source = repaired;
			await writeFile(path, source);
		}
		for (const name of removed) {
			if (source.includes(name) || source.includes('Cannot access ".custom"')) {
				throw new Error(`Tina admin asset retains a browser-external reference: ${path}`);
			}
		}
	}
}

for (const root of roots) await removeBrowserStubs(`${root}/assets`);
for (const root of roots) await assertNoBrokenReferences(root);
console.log(`Tina admin normalization: removed ${removed.length} browser-external assets`);
