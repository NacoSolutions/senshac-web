import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentFields = {
	Banner: ["tinaField(tinaData, 'title')", "tinaField(tinaData, 'subtitle')"],
	Hero: [
		"tinaField(tinaData, 'title')",
		"tinaField(tinaData, 'intro')",
		"tinaField(tinaData, 'ctaText')",
		"tinaField(tinaData, 'mediaId')",
	],
	Copy: [
		"tinaField(tinaData, 'eyebrow')",
		"tinaField(tinaData, 'title')",
		"tinaField(tinaData, 'body')",
	],
	Accordion: [
		"tinaField(tinaData, 'intro')",
		"tinaField(tinaData.items[index], 'title')",
		"tinaField(tinaData.items[index], 'summary')",
		"tinaField(tinaData.items[index].details[detailIndex], 'text')",
	],
	Rows: [
		"tinaField(tinaData, 'title')",
		"tinaField(tinaData, 'intro')",
		"tinaField(tinaData.items[index], 'text')",
	],
	Cta: ["tinaField(tinaData, 'text')", "tinaField(tinaData, 'link')"],
	Showcase: [
		"tinaField(tinaData, 'eyebrow')",
		"tinaField(tinaData, 'title')",
		"tinaField(tinaData, 'mediaId')",
		"tinaField(tinaData.items[index], 'title')",
		"tinaField(tinaData, 'ctaText')",
	],
	Instagram: [
		"tinaField(tinaData, 'title')",
		"tinaField(tinaData, 'description')",
	],
};

const sources = Object.fromEntries(
	await Promise.all(
		Object.entries(componentFields).map(async ([component, fields]) => [
			component,
			{
				fields,
				source: await readFile(
					new URL(
						`../src/components/sections/editorial/${component}.astro`,
						import.meta.url,
					),
					"utf8",
				),
			},
		]),
	),
);

const renderer = await readFile(
	new URL("../src/components/BlocksRenderer.astro", import.meta.url),
	"utf8",
);

test("homepage editorial sections receive the Tina source object", () => {
	for (const component of Object.keys(componentFields)) {
		assert.match(
			renderer,
			new RegExp(
				`<${component === "Instagram" ? "EditorialInstagram" : `Editorial${component}`}\\b[\\s\\S]*?tinaData=\\{block\\}`,
			),
			`${component} must receive its Tina source metadata`,
		);
	}
});

test("homepage editorial text and media fields expose click-to-edit markers", () => {
	for (const [component, { fields, source }] of Object.entries(sources)) {
		assert.match(
			source,
			/import \{ tinaField \} from "@tinacms\/astro\/tina-field";/,
			`${component} must import tinaField`,
		);
		assert.match(
			source,
			/tinaData\??: /,
			`${component} must accept the Tina source object`,
		);
		for (const marker of fields) {
			assert.ok(
				source.includes(marker),
				`${component} should expose ${marker} as a click-to-edit target`,
			);
		}
	}
});
