import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { resolveSiteUrl } from "../src/utils/site-url.mjs";

const siteOrigin = resolveSiteUrl();
const expectedLocales = ["es", "ca", "en"];

for (const locale of expectedLocales) {
	const html = await readFile(resolve("dist", locale, "index.html"), "utf8");
	const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
	assert.ok(canonical, `${locale}: canonical URL is missing`);
	assertOrigin(canonical[1], `${locale}: canonical URL`);

	const alternateUrls = [...html.matchAll(
		/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g,
	)].map((match) => match[1]);
	assert.ok(alternateUrls.length >= expectedLocales.length, `${locale}: hreflang URLs are missing`);
	for (const url of alternateUrls) assertOrigin(url, `${locale}: hreflang URL`);

	const openGraph = html.match(/<meta property="og:url" content="([^"]+)"/);
	assert.ok(openGraph, `${locale}: Open Graph URL is missing`);
	assertOrigin(openGraph[1], `${locale}: Open Graph URL`);

	const structuredData = [...html.matchAll(
		/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
	)].map((match) => JSON.parse(match[1]));
	const localBusiness = structuredData.find((entry) => entry["@type"] === "LocalBusiness");
	assert.ok(localBusiness, `${locale}: LocalBusiness structured data is missing`);
	assertOrigin(localBusiness["@id"], `${locale}: LocalBusiness @id`);
	assertOrigin(localBusiness.url, `${locale}: LocalBusiness URL`);

	if (siteOrigin !== "https://preview.invalid") {
		assert.ok(!html.includes("https://preview.invalid"), `${locale}: placeholder origin leaked into build`);
	}
}

console.log(`site origin: ${siteOrigin} verified in canonical, alternate, Open Graph, and LocalBusiness URLs for ${expectedLocales.join(", ")}`);

function assertOrigin(url, field) {
	assert.equal(new URL(url).origin, siteOrigin, `${field} must use ${siteOrigin}`);
}
