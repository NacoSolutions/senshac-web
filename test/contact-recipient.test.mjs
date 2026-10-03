import assert from "node:assert/strict";
import test from "node:test";
import { resolveContactRecipient } from "../src/utils/contact-recipient.mjs";

test("requires an explicitly configured recipient address", () => {
	assert.equal(resolveContactRecipient(undefined), "");
	assert.equal(resolveContactRecipient(""), "");
	assert.equal(resolveContactRecipient("   "), "");
	assert.equal(resolveContactRecipient(" owner@example.com "), "owner@example.com");
});
