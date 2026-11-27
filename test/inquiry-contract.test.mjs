import assert from "node:assert/strict";
import test from "node:test";
import {
	parseBoundedFormData,
	validateConsultationPayload,
	validateDirectContactPayload,
	validateInquiryPayload,
} from "../src/utils/inquiry-contract.mjs";

const service = (value, label, description = "") => ({
	value,
	label,
	description,
});
const sharedServices = [
	service("integral", "Proyecto Integral"),
	service("decorative-restyling", "Proyecto Decorativo y Restyling"),
];
const paths = {
	paths: [
		{
			value: "first-space",
			serviceOptions: [
				...sharedServices,
				service(
					"strategic-consultation",
					"Consultoría estratégica",
					"Viabilidad.",
				),
			],
			fields: [
				{
					name: "businessType",
					kind: "select",
					required: true,
					options: [{ value: "cafe", label: "Café" }],
				},
				{ name: "plans", kind: "file", required: false },
			],
		},
		{
			value: "existing-space",
			serviceOptions: [
				...sharedServices,
				service(
					"strategic-consultation",
					"Consultoría estratégica",
					"Diagnóstico.",
				),
			],
			fields: [{ name: "challenge", kind: "textarea", required: true }],
		},
		{
			value: "growth",
			serviceOptions: [
				...sharedServices,
				service("other-challenge", "Tengo otra situación"),
			],
			fields: [{ name: "growthPlan", kind: "text", required: true }],
		},
	],
	alternate: {
		fields: [{ name: "challenge", kind: "textarea", required: true }],
	},
};

function payload(entries) {
	const data = new FormData();
	for (const [key, value] of Object.entries(entries)) data.set(key, value);
	return data;
}

function validEntries(overrides = {}) {
	return {
		businessSituation: "first-space",
		desiredService: "strategic-consultation",
		businessType: "cafe",
		...overrides,
	};
}

test("accepts an allowed service for the selected business situation", async () => {
	assert.deepEqual(
		await validateInquiryPayload(paths, payload(validEntries())),
		{
			ok: true,
			businessSituation: "first-space",
			desiredService: "strategic-consultation",
			serviceLabel: "Consultoría estratégica",
			serviceDescription: "Viabilidad.",
			values: { businessType: "cafe" },
			files: [],
		},
	);
});

test("rejects missing or unknown business situations and services", async () => {
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					desiredService: "integral",
				}),
			)
		).error,
		"missing-field",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						businessSituation: "legacy-path",
					}),
				),
			)
		).error,
		"unknown-path",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						desiredService: "unknown-service",
					}),
				),
			)
		).error,
		"invalid-option",
	);
});

test("rejects a known service when it is unavailable for the selected situation", async () => {
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						businessSituation: "growth",
						desiredService: "strategic-consultation",
						growthPlan: "replicate",
					}),
				),
			)
		).error,
		"invalid-option",
	);
});

test("rejects duplicate selector values and legacy field names", async () => {
	const duplicate = payload(validEntries());
	duplicate.append("desiredService", "integral");
	assert.equal(
		(await validateInquiryPayload(paths, duplicate)).error,
		"duplicate-field",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					...validEntries(),
					inquiryPath: "first-space",
				}),
			)
		).error,
		"unknown-field",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					...validEntries(),
					serviceScope: "integral",
				}),
			)
		).error,
		"unknown-field",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					...validEntries(),
					servicePackage: "integral",
				}),
			)
		).error,
		"unknown-field",
	);
});

test("validates situation-specific required fields and select options", async () => {
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						businessType: "",
					}),
				),
			)
		).error,
		"missing-field",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						businessType: "admin",
					}),
				),
			)
		).error,
		"invalid-option",
	);
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload(
					validEntries({
						arbitrary: "value",
					}),
				),
			)
		).error,
		"unknown-field",
	);
});

test("uses alternate-challenge fields only for its allowed growth choice", async () => {
	const result = await validateInquiryPayload(
		paths,
		payload({
			businessSituation: "growth",
			desiredService: "other-challenge",
			challenge: "Pop-up space",
		}),
	);
	assert.deepEqual(result.values, { challenge: "Pop-up space" });
	assert.equal(
		(
			await validateInquiryPayload(
				paths,
				payload({
					businessSituation: "first-space",
					desiredService: "other-challenge",
					challenge: "Pop-up space",
				}),
			)
		).error,
		"invalid-option",
	);
});

test("accepts only bounded attachments with matching type, extension, and signature", async () => {
	const valid = payload({
		...validEntries(),
		plans: new File(["%PDF-1.4"], "plan.pdf", { type: "application/pdf" }),
	});
	assert.equal((await validateInquiryPayload(paths, valid)).ok, true);
	const invalid = payload({
		...validEntries(),
		plans: new File(["not a pdf"], "plan.pdf", { type: "application/pdf" }),
	});
	assert.equal(
		(await validateInquiryPayload(paths, invalid)).error,
		"invalid-file",
	);
	const many = payload(validEntries());
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
	const result = await parseBoundedFormData(requestFor("small"), 1024);
	assert.equal(result.ok, true);
	assert.equal(result.formData.get("value"), "small");
	assert.equal(
		(await parseBoundedFormData(requestFor("x".repeat(2048), false), 1024))
			.error,
		"body-too-large",
	);
});

test("validates alternate-challenge timeline and investment fields when configured", async () => {
	const extendedPaths = {
		...paths,
		alternate: {
			fields: [
				{ name: "website", kind: "text", required: false },
				{ name: "challenge", kind: "textarea", required: true },
				{
					name: "timeline",
					kind: "select",
					required: true,
					options: [{ value: "urgent", label: "Urgente" }],
				},
				{
					name: "investment",
					kind: "select",
					required: true,
					options: [{ value: "under-10k", label: "Menos de 10.000 €" }],
				},
			],
		},
	};
	const ok = await validateInquiryPayload(
		extendedPaths,
		payload({
			businessSituation: "growth",
			desiredService: "other-challenge",
			challenge: "Stand de 100m²",
			timeline: "urgent",
			investment: "under-10k",
		}),
	);
	assert.equal(ok.ok, true);
	assert.deepEqual(ok.values, {
		website: "",
		challenge: "Stand de 100m²",
		timeline: "urgent",
		investment: "under-10k",
	});
	const missingBudget = await validateInquiryPayload(
		extendedPaths,
		payload({
			businessSituation: "growth",
			desiredService: "other-challenge",
			challenge: "Stand de 100m²",
			timeline: "urgent",
		}),
	);
	assert.equal(missingBudget.error, "missing-field");
});

test("ContactForm locks the preselected service when entering from a service CTA", async () => {
	const { readFile } = await import("node:fs/promises");
	const source = await readFile(
		new URL("../src/components/ContactForm.astro", import.meta.url),
		"utf8",
	);
	assert.match(source, /const serviceLocked = Boolean\(/);
	assert.match(source, /name="locked" value="service"/);
	assert.match(source, /disabled=\{serviceLocked\}/);
	assert.match(source, /data-service-locked=\{serviceLocked \? "true" : undefined\}/);
});

function validConsultationEntries(overrides = {}) {
	return {
		mode: "consultation",
		name: "Juan Rodríguez",
		email: "juan@empresa.com",
		phone: "600 000 000",
		company: "Nombre SL",
		message: "Bar en Barcelona. Necesitamos reorganizar la barra y el almacén.",
		privacy: "accepted",
		...overrides,
	};
}

test("validateConsultationPayload accepts valid brief with and without attachments", async () => {
	const withoutFiles = await validateConsultationPayload(
		payload(validConsultationEntries({ phone: "", company: "" })),
	);
	assert.deepEqual(withoutFiles, {
		ok: true,
		mode: "consultation",
		name: "Juan Rodríguez",
		email: "juan@empresa.com",
		phone: "",
		company: "",
		message: "Bar en Barcelona. Necesitamos reorganizar la barra y el almacén.",
		files: [],
	});

	const withFile = await validateConsultationPayload(
		payload({
			...validConsultationEntries(),
			files: new File(["%PDF-1.4"], "local plan.pdf", {
				type: "application/pdf",
			}),
		}),
	);
	assert.equal(withFile.ok, true);
	assert.equal(withFile.files.length, 1);
	assert.equal(withFile.files[0].name, "local_plan.pdf");
});

test("validateConsultationPayload rejects invalid mode, missing fields, bad email, unknown fields, and bad files", async () => {
	assert.equal(
		(
			await validateConsultationPayload(
				payload(validConsultationEntries({ mode: "direct" })),
			)
		).error,
		"invalid-mode",
	);
	assert.equal(
		(
			await validateConsultationPayload(
				payload(validConsultationEntries({ message: "   " })),
			)
		).error,
		"missing-field",
	);
	assert.equal(
		(
			await validateConsultationPayload(
				payload(validConsultationEntries({ privacy: "" })),
			)
		).error,
		"missing-field",
	);
	assert.equal(
		(
			await validateConsultationPayload(
				payload(validConsultationEntries({ email: "not-an-email" })),
			)
		).error,
		"invalid-email",
	);
	assert.equal(
		(
			await validateConsultationPayload(
				payload({ ...validConsultationEntries(), extra: "nope" }),
			)
		).error,
		"unknown-field",
	);
	assert.equal(
		(
			await validateConsultationPayload(
				payload({
					...validConsultationEntries(),
					files: new File(["not a pdf"], "fake.pdf", {
						type: "application/pdf",
					}),
				}),
			)
		).error,
		"invalid-file",
	);

	const tooMany = payload(validConsultationEntries());
	for (let index = 0; index < 4; index++) {
		tooMany.append(
			"files",
			new File(["%PDF-1.4"], `plan-${index}.pdf`, {
				type: "application/pdf",
			}),
		);
	}
	assert.equal((await validateConsultationPayload(tooMany)).error, "invalid-file");
});

test("validateDirectContactPayload accepts valid direct contact submissions", () => {
	const result = validateDirectContactPayload(
		payload({
			mode: "direct",
			name: "Ester García",
			company: "Senshac Studio",
			email: "ester@example.com",
			phone: "+34 661 661 426",
			message: "Queremos reformar un local de 120m² en Barcelona.",
			privacy: "accepted",
		}),
	);
	assert.deepEqual(result, {
		ok: true,
		mode: "direct",
		name: "Ester García",
		company: "Senshac Studio",
		email: "ester@example.com",
		phone: "+34 661 661 426",
		message: "Queremos reformar un local de 120m² en Barcelona.",
	});

	const minimal = validateDirectContactPayload(
		payload({
			mode: "direct",
			name: "Ester",
			email: "ester@example.com",
			message: "Hola",
			privacy: "accepted",
		}),
	);
	assert.equal(minimal.ok, true);
	assert.equal(minimal.company, "");
	assert.equal(minimal.phone, "");
});

test("validateDirectContactPayload rejects missing, malformed, duplicate, or unknown fields", () => {
	assert.equal(
		validateDirectContactPayload(
			payload({
				mode: "direct",
				name: "Ester",
				email: "ester@example.com",
				privacy: "accepted",
			}),
		).error,
		"missing-field",
	);
	assert.equal(
		validateDirectContactPayload(
			payload({
				mode: "direct",
				name: "Ester",
				email: "not-an-email",
				message: "Hola",
				privacy: "accepted",
			}),
		).error,
		"invalid-email",
	);
	assert.equal(
		validateDirectContactPayload(
			payload({
				mode: "direct",
				name: "Ester",
				email: "ester@example.com",
				message: "Hola",
				privacy: "declined",
			}),
		).error,
		"missing-field",
	);
	assert.equal(
		validateDirectContactPayload(
			payload({
				mode: "direct",
				name: "Ester",
				email: "ester@example.com",
				message: "x".repeat(4001),
				privacy: "accepted",
			}),
		).error,
		"field-too-long",
	);
	assert.equal(
		validateDirectContactPayload(
			payload({
				mode: "direct",
				name: "Ester",
				email: "ester@example.com",
				message: "Hola",
				privacy: "accepted",
				businessSituation: "first-space",
			}),
		).error,
		"unknown-field",
	);
	const duplicate = payload({
		mode: "direct",
		name: "Ester",
		email: "ester@example.com",
		message: "Hola",
		privacy: "accepted",
	});
	duplicate.append("email", "other@example.com");
	assert.equal(validateDirectContactPayload(duplicate).error, "duplicate-field");
});
