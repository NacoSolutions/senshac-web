import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";

const redirects = await readFile("public/_redirects", "utf8");
const adminHtml = "dist/admin/index.html";

// Pages must redirect legacy entry URLs before serving Tina's generated bundle.
assert.match(redirects, /^\/admin \/admin\/ 301$/m);
assert.match(redirects, /^\/es\/admin \/admin\/ 301$/m);
assert.doesNotMatch(redirects, /^\/\S+\s+\/admin\/index\.html/m);

// The Tina build runs before Astro and Pages packaging copies public/ into dist/.
await access(adminHtml);
const html = await readFile(adminHtml, "utf8");
assert.match(html, /<html/i);
assert.match(html, /(?:src|href)=["'][^"']+\.(?:js|css)/i);
await access("dist/admin/bridge.js");
await access("dist/_worker.js");

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
		if (source.includes('Cannot access ".custom"')) {
			throw new Error(`Tina admin bundle contains browser externalization: ${path}`);
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
