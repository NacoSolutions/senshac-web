import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const header = await readFile(
	new URL("../src/components/Header.astro", import.meta.url),
	"utf8",
);
const footer = await readFile(
	new URL("../src/components/Footer.astro", import.meta.url),
	"utf8",
);

test("header keeps four localized links visible without a menu drawer", () => {
	const nav = header.match(/<ul class="([^"]*)"/);
	assert.ok(nav);
	assert.match(nav[1], /items-center/);
	assert.doesNotMatch(nav[1], /\bhidden\b/);
	assert.match(header, /navItems\.map/);
	assert.match(header, /data-tina-field=\{t\.nav\.links\?\.\[index\]/);
	assert.match(
		header,
		/aria-current=\{currentPath\.startsWith\(item\.href\) \? "page" : undefined\}/,
	);
	assert.match(header, /getLocalizedPath/);
	assert.match(header, /x-on:click.away="langOpen = false"/);
	assert.doesNotMatch(header, /menuOpen|mobile-menu|toggleMenu|closeMenu|socialLinks/);
});

test("footer uses four responsive columns and keeps text links and editable legal content", () => {
	assert.match(footer, /grid grid-cols-1[^"]*sm:grid-cols-2[^"]*lg:grid-cols-4/);
	assert.match(footer, /footerLinks\.filter/);
	assert.match(footer, /footerLinks\.indexOf\(link\)/);
	assert.match(footer, /contactLink/);
	assert.match(footer, /socialLinks\.map/);
	assert.match(footer, /\{link\.name\}/);
	assert.match(footer, /t\.nav\.social/);
	assert.match(footer, /site\.contact\.email/);
	assert.match(footer, /site\.contact\.phone/);
	assert.match(footer, /t\.footer\.privacy/);
	assert.match(footer, /t\.footer\.legal/);
	assert.match(footer, /attributions\.map/);
	assert.doesNotMatch(footer, /getSocialIcon|i-simple-icons/);
});
