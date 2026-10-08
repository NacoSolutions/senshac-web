import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveSiteUrl } from "../src/utils/site-url.mjs";

test("production site URL takes precedence over the deployment preview URL", () => {
	assert.equal(
		resolveSiteUrl({
			PUBLIC_SITE_URL: "https://cutover.senshac.com/",
			CF_PAGES_BRANCH: "main",
			CF_PAGES_URL: "https://deploy-id.senshac-web.pages.dev",
		}),
		"https://cutover.senshac.com",
	);
});

test("Pages previews use their assigned deployment URL", () => {
	assert.equal(
		resolveSiteUrl({
			PUBLIC_SITE_URL: "https://cutover.senshac.com",
			CF_PAGES_BRANCH: "cutover",
			CF_PAGES_URL: "https://preview-id.senshac-web.pages.dev/",
		}),
		"https://preview-id.senshac-web.pages.dev",
	);
});

test("local builds keep the non-indexable placeholder URL", () => {
	assert.equal(resolveSiteUrl({}), "https://preview.invalid");
});

test("Pages production builds fail closed when the canonical origin is missing", () => {
	assert.equal(
		resolveSiteUrl({
			CF_PAGES_BRANCH: "main",
			CF_PAGES_URL: "https://deployment-id.senshac-web.pages.dev",
		}),
		"https://preview.invalid",
	);
});

test("the configured production branch is not treated as a preview", () => {
	assert.equal(
		resolveSiteUrl({
			CF_PAGES_BRANCH: "production",
			CF_PAGES_URL: "https://deployment-id.senshac-web.pages.dev",
			PUBLIC_SITE_URL: "https://cutover.senshac.com",
			SENSHAC_PRODUCTION_BRANCH: "production",
		}),
		"https://cutover.senshac.com",
	);
});

test("the production content deployment supplies the approved canonical origin", () => {
	const workflow = readFileSync(
		new URL("../.github/workflows/deploy-pages-content.yml", import.meta.url),
		"utf8",
	);
	assert.match(workflow, /PUBLIC_SITE_URL:\s*https:\/\/cutover\.senshac\.com/);
});

test("Astro metadata and generated site URLs share one resolved origin", () => {
	const astroConfig = readFileSync(
		new URL("../astro.config.mjs", import.meta.url),
		"utf8",
	);
	const siteConfig = readFileSync(
		new URL("../src/utils/site-config.ts", import.meta.url),
		"utf8",
	);
	assert.match(astroConfig, /site:\s*siteUrl/);
	assert.match(astroConfig, /"import\.meta\.env\.SENSHAC_SITE_URL":\s*JSON\.stringify\(siteUrl\)/);
	assert.match(siteConfig, /siteUrl:\s*import\.meta\.env\.SENSHAC_SITE_URL/);
});
