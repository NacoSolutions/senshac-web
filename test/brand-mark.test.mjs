import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { getBrandFontFaceCss, getFontAssets } from "../src/utils/font-assets.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [brandMark, header, footer, baseLayout, base] = await Promise.all([
	read("../src/components/BrandMark.astro"),
	read("../src/components/Header.astro"),
	read("../src/components/Footer.astro"),
	read("../src/layouts/BaseLayout.astro"),
	read("../src/layouts/Base.astro"),
]);
const fonts = getFontAssets("https://media.senshac.com/");

test("site chrome uses the selected accessible typographic brand mark", () => {
	assert.match(header, /<BrandMark kind="wordmark" size="header"/);
	assert.match(footer, /<BrandMark kind="symbol" size="footer"/);
	assert.match(baseLayout, /<BrandMark kind="wordmark" size="legacy"/);
	assert.match(brandMark, /aria-hidden="true"/);
	assert.match(brandMark, /font-family:\s*["']Sinteca["']/);
	assert.match(brandMark, /font-family:\s*["']Space Mono["']/);
	assert.match(brandMark, /<span>sens<\/span>/);
	assert.match(brandMark, /<span>hac<\/span>/);
	assert.match(brandMark, /class="brand-mark__star">\*<\/span>/);
	assert.match(header, /aria-label="Senshac home"/);
	assert.doesNotMatch(header, /R2Picture/);
	assert.doesNotMatch(footer, /R2Picture/);
});

test("versioned font assets retain Jozsika Light and load the approved brand fonts", () => {
	assert.equal(
		fonts.jozsikaLight,
		"https://media.senshac.com/fonts/jozsika-light-cb357743.woff2",
	);
	assert.equal(
		fonts.sintecaRegular,
		"https://media.senshac.com/fonts/sinteca/f0d31aad8d62d053c99b97190a47e2d246ae227e9e99c6a5d5cff09ac4bf19cd/sinteca-regular.woff2",
	);
	assert.equal(
		fonts.sintecaMedium,
		"https://media.senshac.com/fonts/sinteca/f0d31aad8d62d053c99b97190a47e2d246ae227e9e99c6a5d5cff09ac4bf19cd/sinteca-medium.woff2",
	);
	assert.equal(
		fonts.sintecaSemibold,
		"https://media.senshac.com/fonts/sinteca/f0d31aad8d62d053c99b97190a47e2d246ae227e9e99c6a5d5cff09ac4bf19cd/sinteca-semibold.woff2",
	);
	assert.equal(
		fonts.spaceMonoRegular,
		"https://media.senshac.com/fonts/space-mono/d9ee25f2cfb7fbc32e3f42ab807e7fca3ab4ff351dcbbb8b66996f940613f7e6/SpaceMono-Regular.woff2",
	);
	const brandFontCss = getBrandFontFaceCss(fonts);
	assert.ok(brandFontCss.includes(fonts.sintecaSemibold));
	assert.ok(brandFontCss.includes(fonts.spaceMonoRegular));
	assert.match(brandFontCss, /font-weight:600/);
	assert.match(brandFontCss, /font-weight:400/);
	assert.match(brandFontCss, /font-display:swap/);
	assert.ok(base.includes("fonts.jozsikaLight"));
	assert.match(base, /getBrandFontFaceCss\(fonts\)/);
	assert.match(baseLayout, /getBrandFontFaceCss/);
});
