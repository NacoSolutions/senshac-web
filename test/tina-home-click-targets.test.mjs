import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { requestWithMetadata } from "@tinacms/astro";
import { tinaField } from "@tinacms/astro/tina-field";

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
const homeRoute = await readFile(
	new URL("../src/pages/[lang]/index.astro", import.meta.url),
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

test("block wrapper targets its metadata-bearing block object", () => {
	assert.match(renderer, /data-tina-field=\{tinaField\(block\)\}/);
	assert.doesNotMatch(renderer, /tinaField\(parentData\.blocks,\s*index\)/);
	assert.equal(
		tinaField({
			_content_source: { queryId: "home-query", path: ["home", "blocks", 0] },
		}),
		"home-query---home.blocks.0",
	);
});

test("static home route stamps Tina metadata onto content blocks", async () => {
	assert.match(homeRoute, /requestWithMetadata\(/);
	assert.match(homeRoute, /query:\s*HomeDocument/);
	assert.match(homeRoute, /data:\s*\{\s*home:\s*page\.data\s*\}/);
	assert.match(homeRoute, /parentData=\{home\}/);
	const { data } = await requestWithMetadata({
		data: { home: { blocks: [{ title: "Example" }] } },
		query: "query home($relativePath: String!) { home(relativePath: $relativePath) { blocks { title } } }",
		variables: { relativePath: "es/home.json" },
	});
	assert.match(tinaField(data.home.blocks[0]), /---home\.blocks\.0$/);
	assert.match(
		tinaField(data.home.blocks[0], "title"),
		/---home\.blocks\.0\.title$/,
	);
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
