import { readdir, unlink } from "node:fs/promises";

const root = "public/admin/assets";

async function removeBrowserStubs(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) {
			await removeBrowserStubs(path);
		} else if (entry.name.startsWith("__vite-browser-external_")) {
			await unlink(path);
		}
	}
}

await removeBrowserStubs(root);
