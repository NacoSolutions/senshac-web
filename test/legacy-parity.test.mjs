import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const renderer = await readFile(
	new URL("../src/components/BlocksRenderer.astro", import.meta.url),
	"utf8",
);
const tinaConfig = await readFile(
	new URL("../tina/config.ts", import.meta.url),
	"utf8",
);
const markerSources = (
	await Promise.all(
		[
			"ContactForm.astro",
			"Footer.astro",
			"Header.astro",
			"sections/contact/ContactBlock.astro",
			"islands/AboutPage.astro",
			"islands/HomePage.astro",
			"islands/ProjectPage.astro",
			"islands/ServicesPage.astro",
			"sections/editorial/Banner.astro",
		].map((file) =>
			readFile(new URL(`../src/components/${file}`, import.meta.url), "utf8"),
		),
	)
).join("\\n");

const genericBlocks = [
	"accordion",
	"banner",
	"callout",
	"carousel",
	"credits",
	"details",
	"feed",
	"form",
	"gallery",
	"hero",
	"list",
	"media",
	"showcase",
	"statement",
	"text",
];

const legacyMarkers = [
	"block",
	"site.branding, 'logo'",
	"site.branding, 'logoWhite'",
	"site.branding, 'symbol'",
	"site.branding, 'symbolWhite'",
	"site.contact, 'email'",
	"site.contact, 'phone'",
	"site.socialLinks, index",
	"t.nav, 'social'",
	"t.nav, 'menu'",
	"t.nav, 'letsTalk'",
	"t.footer, 'privacy'",
	"t.footer, 'legal'",
	'attributions[index], "label"',
	'attributions[index], "name"',
	'f, "company"',
	'f, "name"',
	'f, "email"',
	'f, "phone"',
	'f, "privacy"',
	'f, "submit"',
];

test("Tina and renderer expose only generic block templates", () => {
	for (const block of genericBlocks) {
		assert.match(
			tinaConfig,
			new RegExp(`name: ["']${block}["']`),
			`Tina schema lost ${block}`,
		);
		assert.match(
			renderer,
			new RegExp(`["']${block}["']`),
			`renderer lost ${block}`,
		);
	}
	for (const legacy of ["editorialBanner", "projectBanner", "projectBrief"]) {
		assert.doesNotMatch(tinaConfig, new RegExp(`name: ["']${legacy}["']`));
		assert.doesNotMatch(renderer, new RegExp(`template === ["']${legacy}["']`));
	}
});

test("legacy Tina metadata markers remain present", () => {
	for (const marker of legacyMarkers) {
		const source = `${renderer}\\n${markerSources}`.replace(
			"tinaField((t.footer as any).links, index)",
			"tinaField(t.footer.links, index)",
		);
		assert.ok(
			source.includes(`tinaField(${marker})`),
			`metadata marker lost: tinaField(${marker})`,
		);
	}
	assert.equal(
		(renderer.match(/data-tina-field=/g) ?? []).length,
		1,
		"block wrapper marker should remain singular",
	);
});

test("banner text and nested slogan lines have selectable Tina markers", () => {
	assert.ok(
		markerSources.includes(
			"tinaField(tinaData.topRight as Record<string, unknown>, 'lines', index)",
		),
	);
	assert.ok(markerSources.includes("tinaField(tinaData, 'title')"));
	assert.ok(markerSources.includes("tinaField(tinaData, 'subtitle')"));
});

test("inquiry path questions and options remain selectable in Tina", () => {
	assert.ok(markerSources.includes('tinaField(path, "title")'));
	assert.ok(markerSources.includes("tinaField(questionFields, fieldIndex)"));
	assert.ok(
		markerSources.includes(
			'tinaField(service.sourcePath.serviceOptions[service.sourceIndex], "label")',
		),
	);
	assert.ok(markerSources.includes('name="situation"'));
	assert.ok(markerSources.includes('name="service"'));
	assert.ok(markerSources.includes('name="businessSituation"'));
	assert.ok(markerSources.includes('name="desiredService"'));
	assert.ok(markerSources.includes('type="file"'));
	assert.ok(tinaConfig.includes('name: "serviceOptions"'));
});
