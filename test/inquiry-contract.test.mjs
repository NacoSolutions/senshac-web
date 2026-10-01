import assert from "node:assert/strict";
import test from "node:test";
import {
	parseBoundedFormData,
	validateInquiryPayload,
} from "../src/utils/inquiry-contract.mjs";

const paths = [
	{
		value: "first-space",
		fields: [
			{ name: "businessType", kind: "text", required: true },
			{
				name: "scope",
				kind: "select",
				required: true,
				options: [{ value: "full" }, { value: "consult" }],
			},
			{ name: "plans", kind: "file", required: false },
		],
	},
];

function payload(entries) {
	const data = new FormData();
	for (const [key, value] of Object.entries(entries)) data.set(key, value);
	return data;
}

test("accepts valid path-specific fields and optional file", async () => {
	assert.deepEqual(
		await validateInquiryPayload(
			paths,
			payload({
				inquiryPath: "first-space",
				businessType: "cafe",
				scope: "full",
			}),
		),
		{
			ok: true,
			path: "first-space",
			values: { businessType: "cafe", scope: "full" },
			files: [],
		},
	);
});

test("rejects unknown inquiry paths and missing required fields", async () => {
	assert.equal(
		(await validateInquiryPayload(paths, payload({ inquiryPath: "old-form" })))
			.error,
		"unknown-path",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					inquiryPath: "first-space",
					businessType: "",
					scope: "full",
				}),
			)
		).error,
		"missing-field",
	);
});

test("rejects select values outside the content-defined options", async () => {
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					inquiryPath: "first-space",
					businessType: "cafe",
					scope: "admin",
				}),
			)
		).error,
		"invalid-option",
	);
});

test("accepts only bounded, approved attachments", async () => {
	const data = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
	});
	data.append(
		"plans",
		new File(["%PDF-1.4"], "plan.pdf", { type: "application/pdf" }),
	);
	assert.equal((await validateInquiryPayload(paths, data)).ok, true);
	const bad = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
	});
	bad.append(
		"plans",
		new File(["hello"], "plan.exe", { type: "application/octet-stream" }),
	);
	assert.equal(
		(await validateInquiryPayload(paths, bad)).error,
		"invalid-file",
	);
});

test("rejects unknown and duplicate fields instead of ignoring them", async () => {
	const unknown = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
		arbitrary: "value",
	});
	assert.equal(
		(await validateInquiryPayload(paths, unknown)).error,
		"unknown-field",
	);
	const duplicate = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
	});
	duplicate.append("businessType", "restaurant");
	assert.equal(
		(await validateInquiryPayload(paths, duplicate)).error,
		"duplicate-field",
	);
});

test("rejects mismatched attachment signatures and more than three files", async () => {
	const mismatch = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
	});
	mismatch.append(
		"plans",
		new File(["not a pdf"], "plan.pdf", { type: "application/pdf" }),
	);
	assert.equal(
		(await validateInquiryPayload(paths, mismatch)).error,
		"invalid-file",
	);

	const many = payload({
		inquiryPath: "first-space",
		businessType: "cafe",
		scope: "full",
	});
	for (let index = 0; index < 4; index++)
		many.append(
			"plans",
			new File(["%PDF-1.4"], `plan-${index}.pdf`, { type: "application/pdf" }),
		);
	assert.equal(
		(await validateInquiryPayload(paths, many)).error,
		"invalid-file",
	);
});

test("bounds multipart request bodies before parsing fields", async () => {
	const requestFor = (value, close = true) => {
		const body = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(`value=${value}`));
				if (close) controller.close();
			},
		});
		return new Request("https://example.test/submit", {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body,
			duplex: "half",
		});
	};
	const request = requestFor("small");
	const result = await parseBoundedFormData(request, 1024);
	assert.equal(result.ok, true);
	assert.equal(result.formData.get("value"), "small");

	const largeRequest = requestFor("x".repeat(2048), false);
	assert.equal(
		(await parseBoundedFormData(largeRequest, 1024)).error,
		"body-too-large",
	);
});

test("accepts a selected service package and makes the duplicate scope optional", async () => {
	const packagePaths = [{
		value: "first-space",
		fields: [
			{ name: "businessType", kind: "text", required: true },
			{ name: "serviceScope", kind: "select", required: true, options: [{ value: "full" }] },
		],
	}];
	assert.deepEqual(await validateInquiryPayload(packagePaths, payload({
		inquiryPath: "first-space", name: "A", email: "a@example.test", privacy: "accepted",
		businessType: "cafe", servicePackage: "decorative",
	})), {
		ok: true, path: "first-space", servicePackage: "decorative",
		values: { businessType: "cafe" }, files: [],
	});
});

test("rejects invalid or duplicate service packages", async () => {
	const packagePaths = [{ value: "first-space", fields: [{ name: "serviceScope", kind: "select", required: true, options: [{ value: "full" }] }] }];
	const invalid = payload({ inquiryPath: "first-space", servicePackage: "invented", serviceScope: "full" });
	assert.equal((await validateInquiryPayload(packagePaths, invalid)).error, "invalid-option");
	const duplicate = payload({ inquiryPath: "first-space", servicePackage: "integral", serviceScope: "full" });
	duplicate.append("servicePackage", "decorative");
	assert.equal((await validateInquiryPayload(packagePaths, duplicate)).error, "duplicate-field");
});

test("rejects duplicate scope input when a service package already determines scope", async () => {
	const packagePaths = [{ value: "first-space", fields: [{ name: "serviceScope", kind: "select", required: true, options: [{ value: "full" }] }] }];
	const data = payload({ inquiryPath: "first-space", servicePackage: "integral", serviceScope: "full" });
	assert.equal((await validateInquiryPayload(packagePaths, data)).error, "unknown-field");
});
