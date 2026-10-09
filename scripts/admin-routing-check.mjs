import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

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

const port = await new Promise((resolve, reject) => {
	const server = createServer();
	server.once("error", reject);
	server.listen(0, "127.0.0.1", () => {
		const { port } = server.address();
		server.close((error) => (error ? reject(error) : resolve(port)));
	});
});
const origin = `http://127.0.0.1:${port}`;
const state = await mkdtemp(join(tmpdir(), "senshac-pages-routing-"));
const pages = spawn(
	"wrangler",
	[
		"pages",
		"dev",
		"dist",
		"--ip",
		"127.0.0.1",
		"--port",
		String(port),
		"--persist-to",
		state,
		"--show-interactive-dev-session=false",
		"--log-level",
		"error",
	],
	{ stdio: "ignore" },
);
try {
	let ready = false;
	for (let attempt = 0; attempt < 40; attempt++) {
		if (pages.exitCode !== null) throw new Error("wrangler pages dev exited early");
		try {
			await fetch(`${origin}/`, { signal: AbortSignal.timeout(500) });
			ready = true;
			break;
		} catch {
			await delay(250);
		}
	}
	assert.ok(ready, "wrangler pages dev did not become ready");
	for (const path of ["admin", "admin/", "es/admin", "es/admin/", "ca/admin", "en/admin"]) {
		const response = await fetch(`${origin}/${path}`, { redirect: "manual" });
		assert.equal(response.status, 302, `/${path} did not redirect`);
		assert.equal(new URL(response.headers.get("location"), origin).href, `${origin}/admin/index.html`);
	}
} finally {
	if (pages.exitCode === null) {
		pages.kill("SIGTERM");
		const exited = await Promise.race([
			once(pages, "exit").then(() => true),
			delay(2_000).then(() => false),
		]);
		if (!exited) {
			pages.kill("SIGKILL");
			await once(pages, "exit");
		}
	}
	await rm(state, { recursive: true, force: true });
}

console.log("admin routing and generated icon CSS: covered");
