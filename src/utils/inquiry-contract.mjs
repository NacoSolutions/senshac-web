const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 3;
const allowedFiles = new Map([
	[
		"application/pdf",
		{
			extensions: ["pdf"],
			signature: (bytes) =>
				new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-",
		},
	],
	[
		"image/jpeg",
		{
			extensions: ["jpg", "jpeg"],
			signature: (bytes) =>
				bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
		},
	],
	[
		"image/png",
		{
			extensions: ["png"],
			signature: (bytes) =>
				[137, 80, 78, 71, 13, 10, 26, 10].every(
					(value, index) => bytes[index] === value,
				),
		},
	],
	[
		"image/webp",
		{
			extensions: ["webp"],
			signature: (bytes) =>
				new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" &&
				new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP",
		},
	],
]);
const commonFields = new Set([
	"name",
	"company",
	"email",
	"phone",
	"privacy",
	"cf-turnstile-response",
	"businessSituation",
	"desiredService",
]);
const consultationFields = new Set([
	"mode",
	"name",
	"email",
	"phone",
	"company",
	"message",
	"files",
	"privacy",
	"cf-turnstile-response",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function validateFiles(entries, existingFiles = []) {
	const fieldFiles = [];
	for (const file of entries) {
		if (!(file instanceof File) || file.size === 0) continue;
		const extension = file.name.split(".").at(-1)?.toLowerCase();
		const policy = allowedFiles.get(file.type);
		if (
			!policy?.extensions.includes(extension) ||
			file.size > MAX_FILE_BYTES ||
			existingFiles.length >= MAX_FILES
		) {
			return { ok: false, error: "invalid-file" };
		}
		const bytes = new Uint8Array(await file.arrayBuffer());
		if (!policy.signature(bytes)) {
			return { ok: false, error: "invalid-file" };
		}
		const attachment = {
			name: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
			type: file.type,
			bytes,
		};
		existingFiles.push(attachment);
		fieldFiles.push(attachment);
	}
	if (
		existingFiles.reduce((sum, file) => sum + file.bytes.byteLength, 0) >
		MAX_TOTAL_FILE_BYTES
	) {
		return { ok: false, error: "invalid-file" };
	}
	return { ok: true, fieldFiles, files: existingFiles };
}

export async function parseBoundedFormData(request, maxBytes) {
	const reader = request.body?.getReader();
	if (!reader) return { ok: false, error: "invalid-form" };
	const chunks = [];
	let byteLength = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		byteLength += value.byteLength;
		if (byteLength > maxBytes) {
			try {
				await reader.cancel();
			} catch {
				// A peer close can race with cancel once the stream crosses the cap.
			}
			return { ok: false, error: "body-too-large" };
		}
		chunks.push(value);
	}

	const body = new Uint8Array(byteLength);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	const headers = new Headers(request.headers);
	headers.delete("content-length");
	headers.delete("transfer-encoding");
	try {
		const boundedRequest = new Request(request.url, {
			method: request.method,
			headers,
			body,
		});
		return { ok: true, formData: await boundedRequest.formData() };
	} catch {
		return { ok: false, error: "invalid-form" };
	}
}

export async function validateInquiryPayload(inquiryPaths, formData) {
	for (const name of ["businessSituation", "desiredService"])
		if (formData.getAll(name).length > 1)
			return { ok: false, error: "duplicate-field" };
	const businessSituation = String(
		formData.get("businessSituation") ?? "",
	).trim();
	const desiredService = String(formData.get("desiredService") ?? "").trim();
	if (!businessSituation) return { ok: false, error: "missing-field" };
	if (!desiredService) return { ok: false, error: "missing-field" };
	const path = inquiryPaths.paths.find(
		(item) => item.value === businessSituation,
	);
	if (!path) return { ok: false, error: "unknown-path" };
	const service = path.serviceOptions.find(
		(item) => item.value === desiredService,
	);
	if (!service) return { ok: false, error: "invalid-option" };
	const alternateChallenge = desiredService === "other-challenge";
	const fields = alternateChallenge
		? inquiryPaths.alternate?.fields
		: path.fields;
	if (!Array.isArray(fields) || !fields.length)
		return { ok: false, error: "invalid-config" };
	for (const name of [
		"name",
		"company",
		"email",
		"phone",
		"privacy",
		"cf-turnstile-response",
	]) {
		if (formData.getAll(name).length > 1)
			return { ok: false, error: "duplicate-field" };
	}
	const definitions = new Map(fields.map((field) => [field.name, field]));
	const acceptedFields = new Set([...commonFields, ...definitions.keys()]);
	for (const [name] of formData.entries()) {
		if (!acceptedFields.has(name)) return { ok: false, error: "unknown-field" };
	}
	const values = {};
	const files = [];

	for (const field of fields) {
		if (field.kind === "file") {
			const validatedFiles = await validateFiles(
				formData.getAll(field.name),
				files,
			);
			if (!validatedFiles.ok) return validatedFiles;
			if (field.required && !validatedFiles.fieldFiles.length)
				return { ok: false, error: "missing-field" };
			continue;
		}

		const entries = formData.getAll(field.name);
		if (entries.length > 1) return { ok: false, error: "duplicate-field" };
		const value = String(entries[0] ?? "").trim();
		if (field.required && !value) return { ok: false, error: "missing-field" };
		if (
			field.kind === "select" &&
			value &&
			!field.options?.some((option) => option.value === value)
		) {
			return { ok: false, error: "invalid-option" };
		}
		if (value.length > 4000) return { ok: false, error: "field-too-long" };
		values[field.name] = value;
	}

	return {
		ok: true,
		businessSituation: path.value,
		desiredService,
		serviceLabel: service.label,
		serviceDescription: service.description,
		values,
		files,
	};
}

export async function validateConsultationPayload(formData) {
	for (const [name] of formData.entries()) {
		if (!consultationFields.has(name)) {
			return { ok: false, error: "unknown-field" };
		}
	}
	for (const name of [
		"mode",
		"name",
		"email",
		"phone",
		"company",
		"message",
		"privacy",
		"cf-turnstile-response",
	]) {
		if (formData.getAll(name).length > 1) {
			return { ok: false, error: "duplicate-field" };
		}
	}

	const mode = String(formData.get("mode") ?? "").trim();
	if (mode !== "consultation") return { ok: false, error: "invalid-mode" };

	const name = String(formData.get("name") ?? "").trim();
	const email = String(formData.get("email") ?? "").trim();
	const phone = String(formData.get("phone") ?? "").trim();
	const company = String(formData.get("company") ?? "").trim();
	const message = String(formData.get("message") ?? "").trim();
	const privacyAccepted = formData.get("privacy") === "accepted";

	if (
		!name ||
		!email ||
		!message ||
		!privacyAccepted ||
		name.length > 200 ||
		email.length > 254 ||
		phone.length > 80 ||
		company.length > 200
	) {
		return { ok: false, error: "missing-field" };
	}
	if (message.length > 4000) return { ok: false, error: "field-too-long" };
	if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "invalid-email" };

	const validatedFiles = await validateFiles(formData.getAll("files"));
	if (!validatedFiles.ok) return validatedFiles;

	return {
		ok: true,
		mode: "consultation",
		name,
		email,
		phone,
		company,
		message,
		files: validatedFiles.files,
	};
}
