import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";

const redirects = await readFile("public/_redirects", "utf8");
const adminHtml = "dist/admin/index.html";

// Pages must redirect legacy entry URLs before serving Tina's generated bundle.
for (const entry of [
	"/admin /admin/index.html 302",
	"/admin/ /admin/index.html 302",
	"/es/admin /admin/index.html 302",
	"/es/admin/ /admin/index.html 302",
]) {
	assert.match(redirects, new RegExp(`^${entry.replaceAll(".", "\\.")}$`, "m"));
}

// The Tina build runs before Astro and Pages packaging copies public/ into dist/.
await access(adminHtml);
const html = await readFile(adminHtml, "utf8");
assert.match(html, /<html/i);
const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/gi)].map((match) => match[1]);
assert.ok(assetUrls.length > 0, "Tina admin HTML has no JS or CSS assets");
for (const assetUrl of assetUrls) {
	assert.ok(assetUrl.startsWith("/"), `Tina admin asset is not root-relative: ${assetUrl}`);
	await access(`dist${new URL(assetUrl, "https://senshac.invalid").pathname}`);
}
await access("dist/admin/bridge.js");
await access("dist/_worker.js");

// Root brand assets must ship with the Pages artifact; otherwise the deployed
// site loses its favicon even though the layout still emits the links.
for (const asset of [
	"dist/favicon.ico",
	"dist/favicon-32x32.png",
	"dist/favicon-192x192.png",
	"dist/apple-touch-icon.png",
]) {
	await access(asset);
}

// The generated SPA must not ship Vite's Node-module browser stub. It is
// harmless during bundling but throws when Tina's client reaches util.inspect.
async function assertNoBrowserExternalization(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) {
			await assertNoBrowserExternalization(path);
			continue;
		}
		if (!entry.name.endsWith(".js")) continue;
		const source = await readFile(path, "utf8");
		for (const marker of [
			"__vite-browser-external_",
			'Module \"\" has been externalized',
			'Cannot access \".custom\"',
		]) {
			if (source.includes(marker)) throw new Error(`Tina admin bundle contains browser externalization (${marker}): ${path}`);
		}
	}
}
await assertNoBrowserExternalization("dist/admin");

// Astro inlines the UnoCSS layer into rendered pages. Check the shipped CSS,
// rather than source classes, so missing Iconify collections cannot regress.
async function readHtml(directory) {
	const html = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) html.push(...(await readHtml(path)));
		else if (entry.name.endsWith(".html")) html.push(await readFile(path, "utf8"));
	}
	return html;
}
const publicHtml = (await readHtml("dist")).join("\n");
for (const icon of [
	"i-lucide-menu",
	"i-lucide-x",
	"i-lucide-chevron-down",
	"i-lucide-arrow-up-right",
	"i-simple-icons-instagram",
	"i-simple-icons-linkedin",
]) {
	assert.ok(publicHtml.includes(`.${icon}{`), `missing emitted icon CSS: ${icon}`);
}
assert.ok(publicHtml.includes("--un-icon:url("), "icon CSS has no emitted mask source");

console.log("admin routing and generated icon CSS: covered");
