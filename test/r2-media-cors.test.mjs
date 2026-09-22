import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const media = await readFile(new URL("../src/lib/r2-media.ts", import.meta.url), "utf8");
const index = await readFile(new URL("../src/pages/api/s3/media/index.ts", import.meta.url), "utf8");
const deleteRoute = await readFile(new URL("../src/pages/api/s3/media/[...media].ts", import.meta.url), "utf8");

test("media auth and CORS policy is present on both handlers", () => {
	assert.match(media, /isUserAuthorized/);
	assert.match(media, /TINA_MEDIA_ALLOWED_ORIGINS/);
	assert.match(media, /Access-Control-Allow-Origin/);
	assert.match(media, /Access-Control-Allow-Methods/);
	assert.match(media, /Access-Control-Allow-Headers/);
	assert.match(index, /export const OPTIONS/);
	assert.match(deleteRoute, /export const OPTIONS/);
	assert.match(index, /allowedMediaOrigin\(origin, env\)/);
	assert.match(deleteRoute, /allowedMediaOrigin\(origin, env\)/);
});

test("media writes remain behind authorization and are not public routes", () => {
	assert.match(index, /PutObjectCommand/);
	assert.match(index, /await authorized\(request\)/);
	assert.match(deleteRoute, /DeleteObjectCommand/);
	assert.match(deleteRoute, /await authorized\(request\)/);
});
