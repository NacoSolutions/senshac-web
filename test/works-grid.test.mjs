import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const works = await readFile(
	new URL("../src/pages/[lang]/works/index.astro", import.meta.url),
	"utf8",
);

test("works page keeps project data and uses a two-column desktop grid", () => {
	assert.match(works, /sortedProjects\.map/);
	assert.match(works, /href: `\/\$\{lang\}\/works\/\$\{project\.data\.slug\}`/);
	assert.match(works, /alt: bannerBlock\?\.alt \|\| project\.data\.title/);
	assert.match(works, /alt=\{\`\$\{work\.category\}: \$\{work\.title\}\`\}/);
	assert.match(
		works,
		/\.works-index__list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
	);
	assert.match(
		works,
		/@media \(max-width: 47\.99rem\)\s*\{[\s\S]*?\.works-index__list\s*\{[^}]*grid-template-columns:\s*1fr/s,
	);
	assert.doesNotMatch(works, /works-index__item--(?:wide|portrait|landscape)/);
});
