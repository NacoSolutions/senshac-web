import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolvePageChromeFieldTarget } from "../src/utils/page-chrome.mjs";

test("page chrome markers target nested fields or the optional parent field", () => {
	const pageData = { chrome: { header: { style: "transparent" } } };
	assert.deepEqual(resolvePageChromeFieldTarget(pageData, "chrome", "header"), {
		data: pageData.chrome,
		field: "header",
	});
	assert.deepEqual(resolvePageChromeFieldTarget({ chrome: undefined }, "chrome", "footer"), {
		data: { chrome: undefined },
		field: "chrome",
	});
	assert.deepEqual(resolvePageChromeFieldTarget({ projects: {} }, "projects.chrome", "footer"), {
		data: {},
		field: "chrome",
	});
});

test("live chrome islands fetch the page document as an editable reference", async () => {
	const layout = await readFile(new URL("../src/layouts/Base.astro", import.meta.url), "utf8");
	const islands = await readFile(new URL("../src/lib/tina-islands.ts", import.meta.url), "utf8");
	const header = await readFile(new URL("../src/components/Header.astro", import.meta.url), "utf8");
	const footer = await readFile(new URL("../src/components/Footer.astro", import.meta.url), "utf8");

	assert.equal((layout.match(/pageSource:\s*pageSourceParam/g) ?? []).length, 2);
	assert.equal((islands.match(/fetchPageSource\(pageSource, transData, env\)/g) ?? []).length, 2);
	assert.match(islands, /getPageChromeDocument\(/);
	assert.match(header, /tinaField\(pageChromeTarget\.data, pageChromeTarget\.field\)/);
	assert.match(footer, /tinaField\(pageChromeTarget\.data, pageChromeTarget\.field\)/);
});

test("editorial routes identify the document that owns their page chrome", async () => {
	const cases = [
		["../src/pages/[lang]/index.astro", /collection:\s*"home"/],
		["../src/pages/[lang]/studio.astro", /collection:\s*"about"/],
		["../src/pages/[lang]/methods.astro", /collection:\s*"services"/],
		["../src/pages/[lang]/contact.astro", /collection:\s*"contact"/],
		["../src/pages/[lang]/works/[slug].astro", /collection:\s*"projects"/],
		["../src/pages/[lang]/works/index.astro", /collection:\s*"translations"/],
		["../src/pages/[lang]/privacy-policy.astro", /collection:\s*"legal"/],
		["../src/pages/[lang]/legal-notice.astro", /collection:\s*"legal"/],
	];

	for (const [route, collection] of cases) {
		assert.match(await readFile(new URL(route, import.meta.url), "utf8"), collection, route);
	}
});
