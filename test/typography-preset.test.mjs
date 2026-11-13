import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { DEFAULT_TYPOGRAPHY_PRESET, TYPOGRAPHY_PRESETS, resolveTypographyPreset } from "../src/utils/typography.mjs";
import { TYPOGRAPHY_PRESET_OPTIONS } from "../src/utils/typography.mjs";

test("the approved font pairings are finite and preserve the current default", () => {
	assert.deepEqual(Object.keys(TYPOGRAPHY_PRESETS), ["senshac", "sinteca", "editorial"]);
	assert.deepEqual(TYPOGRAPHY_PRESETS.senshac, { body: "Sinteca", display: "Jozsika" });
	assert.deepEqual(TYPOGRAPHY_PRESETS.sinteca, { body: "Sinteca", display: "Sinteca" });
	assert.deepEqual(TYPOGRAPHY_PRESETS.editorial, { body: "Jozsika", display: "Sinteca" });
	assert.equal(DEFAULT_TYPOGRAPHY_PRESET, "senshac");
});

test("missing or unknown preset values resolve to the current Senshac pairing", () => {
	for (const value of [undefined, null, "", "toString", "Comic Sans"]) {
		assert.equal(resolveTypographyPreset(value), "senshac");
	}
	assert.equal(resolveTypographyPreset("editorial"), "editorial");
});


test("Tina exposes the approved sitewide preset choices with editor guidance", async () => {
	const config = await readFile(new URL("../tina/config.ts", import.meta.url), "utf8");
	const runtimeSchema = await readFile(new URL("../src/content.config.ts", import.meta.url), "utf8");
	assert.match(config, /name: "typography"/);
	assert.match(config, /label: "Typography"/);
	assert.match(config, /options: \[\.\.\.TYPOGRAPHY_PRESET_OPTIONS\]/);
	assert.match(config, /ui:\s*\{\s*defaultValue:\s*DEFAULT_TYPOGRAPHY_PRESET\s*\}/s);
	assert.match(runtimeSchema, /preset:\s*typographyPreset\.default\(DEFAULT_TYPOGRAPHY_PRESET\)/);
	assert.match(runtimeSchema, /\.default\(\{\s*preset:\s*DEFAULT_TYPOGRAPHY_PRESET\s*\}\)/);
	assert.deepEqual(TYPOGRAPHY_PRESET_OPTIONS.map(({ value }) => value), Object.keys(TYPOGRAPHY_PRESETS));
	assert.ok(TYPOGRAPHY_PRESET_OPTIONS.every(({ label }) => label.length > 10));
});


test("all Tina rich-text fields use the supported safe toolbar", async () => {
	const config = await readFile(new URL("../tina/config.ts", import.meta.url), "utf8");
	const richTextFields = config.match(/type:\s*"rich-text"/g) ?? [];
	const configuredToolbars = config.match(/overrides:\s*\{\s*toolbar:\s*\[\.\.\.SAFE_RICH_TEXT_TOOLBAR\]\s*\}/g) ?? [];
	assert.ok(richTextFields.length > 0);
	assert.equal(configuredToolbars.length, richTextFields.length);
	assert.match(config, /SAFE_RICH_TEXT_TOOLBAR = \["heading", "bold", "italic", "strikethrough", "link", "ul", "ol", "quote"\] as const/);
});


test("both layouts use the normalized site preset and shared font-role tokens", async () => {
	const [base, legacy, theme, global] = await Promise.all([
		readFile(new URL("../src/layouts/Base.astro", import.meta.url), "utf8"),
		readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
		readFile(new URL("../src/styles/typography.css", import.meta.url), "utf8"),
		readFile(new URL("../src/styles/global.css", import.meta.url), "utf8"),
	]);
	assert.match(base, /data-typography-preset=\{typographyPreset\}/);
	assert.match(legacy, /data-typography-preset=\{typographyPreset\}/);
	assert.match(theme, /data-typography-preset="sinteca"/);
	assert.match(theme, /data-typography-preset="editorial"/);
	assert.match(global, /font-family:\s*var\(--site-font-body/);
	assert.match(global, /font-family:\s*var\(--site-font-display/);
});
