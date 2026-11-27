import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const works = await readFile(
	new URL("../src/pages/[lang]/works/index.astro", import.meta.url),
	"utf8",
);

test("works page uses the 6-row 12-column editorial layout with localized cards and R2Picture", () => {
	assert.match(works, /import R2Picture from "\.\.\/\.\.\/\.\.\/components\/R2Picture\.astro";/);
	assert.match(works, /mediaSlot="content"/);
	assert.match(works, /class="w-full h-full object-cover"/);

	for (const mediaId of [
		"projects/index/calma-hero",
		"projects/index/doley-desk",
		"projects/index/doley-salon",
		"projects/index/cinquanta-nou-main",
		"projects/index/cinquanta-nou-carta",
		"projects/index/o-optica-sketch",
		"projects/index/rude-identity",
		"projects/index/rude-store",
		"projects/index/la-trobada-bar",
		"projects/index/la-trobada-carta",
	]) {
		assert.ok(works.includes(mediaId), `missing mediaId ${mediaId}`);
	}

	for (const href of [
		"/es/works/doley",
		"/es/works/rude",
		"/es/works/la-trobada",
		"/ca/works/doley",
		"/en/works/rude",
	]) {
		assert.ok(works.includes(href), `missing case-study href ${href}`);
	}

	assert.match(
		works,
		/\.works-index__list\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/s,
	);
	assert.match(
		works,
		/@media \(max-width: 47\.99rem\)\s*\{[\s\S]*?\.works-index__list\s*\{[^}]*grid-template-columns:\s*1fr/s,
	);
	assert.match(
		works,
		/:global\(body:has\(\.works-index\) header \.editorial-shell\)/,
	);
});
