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

test("header has localized desktop navigation and an accessible mobile menu control", () => {
	assert.match(header, /<ul class="hidden list-none items-center gap-6 p-0 lg:flex"/);
	assert.match(header, /navItems\.map/);
	assert.match(header, /data-tina-field=\{t\.nav\.links\?\.\[index\]/);
	assert.match(
		header,
		/aria-current=\{currentPath\.startsWith\(item\.href\) \? "page" : undefined\}/,
	);
	assert.match(header, /aria-controls="mobile-menu"/);
	assert.match(header, /id="mobile-menu"/);
	assert.match(header, /aria-expanded="false"[\s\S]*x-bind:aria-expanded="menuOpen"/);
	assert.match(header, /class="p-2 transition-colors lg:hidden"/);
	assert.match(header, /bg-black\/20 z-\[60\] lg:hidden/);
	assert.match(header, /overflow-y-auto lg:hidden/);
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
