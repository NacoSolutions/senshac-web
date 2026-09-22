import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const redirects = await readFile("public/_redirects", "utf8");
const adminHtml = "dist/admin/index.html";

// Pages must redirect legacy entry URLs before serving Tina's generated bundle.
assert.match(redirects, /^\/admin \/admin\/ 301$/m);
assert.match(redirects, /^\/es\/admin \/admin\/ 301$/m);
assert.doesNotMatch(redirects, /^\/\S+\s+\/admin\/index\.html/m);

// The Tina build runs before Astro and Pages packaging copies public/ into dist/.
await access(adminHtml);
const html = await readFile(adminHtml, "utf8");
assert.match(html, /<html/i);
assert.match(html, /(?:src|href)=["'][^"']+\.(?:js|css)/i);
await access("dist/admin/bridge.js");
await access("dist/_worker.js");

console.log("admin routing: /admin/ and /es/admin are covered; Tina assets are packaged");
