import assert from "node:assert/strict";
import test from "node:test";
import {
	findServicePackage,
	scenarioContactHref,
} from "../src/utils/service-packages.mjs";

const blocks = [{ items: [
	{ title: "CONSULTORÍA EXPRÉS", href: "/es/contact?package=consultation" },
	{ title: "PROYECTO DECORATIVO", href: "/es/contact?package=decorative" },
]}];

test("finds only a localized package explicitly wired from methods content", () => {
	assert.deepEqual(findServicePackage(blocks, "es", "decorative"), {
		id: "decorative", title: "PROYECTO DECORATIVO",
	});
	assert.equal(findServicePackage(blocks, "en", "decorative"), null);
	assert.equal(findServicePackage(blocks, "es", "unknown"), null);
});

test("builds scenario links that preserve the selected package", () => {
	assert.equal(
		scenarioContactHref("es", "growth", "integral"),
		"/es/contact?path=growth&package=integral",
	);
});
