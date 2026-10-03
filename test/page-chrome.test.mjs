import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolvePageChrome } from "../src/utils/page-chrome.mjs";

test("page chrome overrides global appearance and behavior per element", () => {
	const globalChrome = {
		header: { mode: "fixed", atFinal: "opaque-light", scrolling: "transparent-adaptive" },
		footer: { mode: "scrolling", atFinal: "opaque-dark", scrolling: "opaque-dark" },
	};
	const pageChrome = {
		header: { style: "default", mode: "scrolling", scrolling: "opaque-light" },
	};

	assert.deepEqual(resolvePageChrome(globalChrome, pageChrome), {
		header: { style: "default", mode: "scrolling", atFinal: "opaque-light", scrolling: "opaque-light" },
		footer: globalChrome.footer,
	});
});

test("page chrome keeps global settings when page overrides are absent", () => {
	const globalChrome = {
		header: { mode: "fixed", atFinal: "opaque-light", scrolling: "transparent-adaptive" },
		footer: { mode: "scrolling", atFinal: "opaque-dark", scrolling: "opaque-dark" },
	};

	assert.deepEqual(resolvePageChrome(globalChrome), globalChrome);
});

test("page overrides reach both Tina chrome islands and every editorial route", async () => {
	const layout = await readFile(new URL("../src/layouts/Base.astro", import.meta.url), "utf8");
	const islands = await readFile(new URL("../src/lib/tina-islands.ts", import.meta.url), "utf8");
	assert.match(layout, /pageChrome:\s*pageChromeParam/);
	assert.equal((layout.match(/pageChrome:\s*pageChromeParam/g) ?? []).length, 2);
	assert.equal((islands.match(/resolvePageChrome\(data\?\.site\?\.data\?\.siteConfig\?\.chrome/g) ?? []).length, 2);

	for (const route of [
		"../src/pages/[lang]/index.astro",
		"../src/pages/[lang]/studio.astro",
		"../src/pages/[lang]/methods.astro",
		"../src/pages/[lang]/contact.astro",
		"../src/pages/[lang]/works/[slug].astro",
		"../src/pages/[lang]/works/index.astro",
		"../src/pages/[lang]/privacy-policy.astro",
		"../src/pages/[lang]/legal-notice.astro",
	]) {
		assert.match(await readFile(new URL(route, import.meta.url), "utf8"), /pageChrome=/, route);
	}
});
