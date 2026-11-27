export const prerender = false;

import { getEntry } from "astro:content";
import type { APIRoute } from "astro";
import {
	parseBoundedFormData,
	validateConsultationPayload,
	validateDirectContactPayload,
	validateInquiryPayload,
} from "../../../utils/inquiry-contract.mjs";
import { resolveContactRecipient } from "../../../utils/contact-recipient.mjs";

const MAX_REQUEST_BYTES = 12 * 1024 * 1024;

async function verifyTurnstile(
	token: string,
	ip: string | null,
	secretKey?: string,
): Promise<boolean> {
	if (!secretKey) return !import.meta.env.PROD;

	try {
		const body = new FormData();
		body.append("secret", secretKey);
		body.append("response", token);
		if (ip) body.append("remoteip", ip);
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				body,
			},
		);
		if (!response.ok) return false;
		const result = (await response.json()) as { success: boolean };
		return result.success;
	} catch {
		return false;
	}
}

function encodeBase64(bytes: Uint8Array): string {
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	}
	return btoa(binary);
}

function safeReturnUrl(
	request: Request,
	lang: string,
	fallbackPath = `/${lang}/contact`,
): URL {
	const fallback = new URL(fallbackPath, request.url);
	const allowedPaths = new Set([
		`/${lang}/contact`,
		`/${lang}/methods/consultation`,
	]);
	const referer = request.headers.get("Referer");
	if (!referer) return fallback;
	try {
		const candidate = new URL(referer);
		return candidate.origin === new URL(request.url).origin &&
			allowedPaths.has(candidate.pathname)
			? candidate
			: fallback;
	} catch {
		return fallback;
	}
}

export const POST: APIRoute = async ({ request, params, locals }) => {
	const runtimeEnv = (
		locals as { runtime?: { env?: Record<string, string | undefined> } }
	)?.runtime?.env;
	const getEnv = (key: string): string | undefined =>
		runtimeEnv?.[key] ??
		(import.meta.env as Record<string, string | undefined>)[key];
	const sender =
		getEnv("CONTACT_FROM")?.trim() || "Senshac Web <noreply@senshac.com>";
	const lang = params.lang || "es";
	const translations = await getEntry("translations", lang);
	if (!translations)
		return new Response("Translations not found", { status: 500 });
	const t = translations.data.contactForm;
	const returnUrl = safeReturnUrl(request, lang);
	const redirect = (
		error?: string,
		success = false,
		businessSituation?: string,
		desiredService?: string,
	) => {
		returnUrl.searchParams.delete("contact_error");
		returnUrl.searchParams.delete("contact_success");
		returnUrl.searchParams.delete("path");
		returnUrl.searchParams.delete("package");
		if (error) returnUrl.searchParams.set("contact_error", error);
		if (success) returnUrl.searchParams.set("contact_success", "1");
		if (businessSituation)
			returnUrl.searchParams.set("situation", businessSituation);
		if (desiredService) returnUrl.searchParams.set("service", desiredService);
		return Response.redirect(returnUrl.toString(), 303);
	};

	const length = Number(request.headers.get("content-length") ?? 0);
	if (length > MAX_REQUEST_BYTES) return redirect("invalidFile");

	try {
		const parsedBody = await parseBoundedFormData(request, MAX_REQUEST_BYTES);
		if (!parsedBody.ok) {
			return redirect(
				parsedBody.error === "body-too-large" ? "invalidFile" : "error",
			);
		}
		const formData = parsedBody.formData;
		const mode = String(formData.get("mode") ?? "").trim();
		if (mode === "consultation") {
			const consultationUrl = safeReturnUrl(
				request,
				lang,
				`/${lang}/methods/consultation`,
			);
			const redirectConsultation = (error?: string, success = false) => {
				consultationUrl.searchParams.delete("contact_error");
				consultationUrl.searchParams.delete("contact_success");
				if (error) consultationUrl.searchParams.set("contact_error", error);
				if (success) consultationUrl.searchParams.set("contact_success", "1");
				return Response.redirect(consultationUrl.toString(), 303);
			};

			const validatedConsultation = await validateConsultationPayload(formData);
			if (!validatedConsultation.ok) {
				const error =
					validatedConsultation.error === "invalid-file"
						? "invalidFile"
						: validatedConsultation.error === "invalid-email"
							? "invalidEmail"
							: "missingFields";
				return redirectConsultation(error);
			}

			const token = String(formData.get("cf-turnstile-response") ?? "");
			if (
				!(await verifyTurnstile(
					token,
					request.headers.get("CF-Connecting-IP"),
					getEnv("TURNSTILE_SECRET_KEY"),
				))
			) {
				return redirectConsultation("turnstileFailed");
			}

			const apiKey = getEnv("RESEND_API_KEY");
			const recipient = resolveContactRecipient(getEnv("CONTACT_EMAIL"));
			if (!apiKey || !recipient) {
				console.error(
					"Contact delivery configuration is incomplete; consultation brief rejected.",
				);
				return new Response("Contact delivery unavailable", { status: 503 });
			}

			const text = [
				"New Strategic Consultation brief from senshac.com",
				`Name: ${validatedConsultation.name}`,
				`Company: ${validatedConsultation.company || "Not provided"}`,
				`Email: ${validatedConsultation.email}`,
				`Phone: ${validatedConsultation.phone || "Not provided"}`,
				`Business & main concerns: ${validatedConsultation.message}`,
				`Language: ${lang}`,
			].join("\n");

			const attachments = validatedConsultation.files.map((file) => ({
				filename: file.name,
				content: encodeBase64(file.bytes),
			}));

			const response = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from: sender,
					to: recipient,
					reply_to: validatedConsultation.email,
					subject: `Consultoría Estratégica: ${validatedConsultation.name}`,
					text,
					...(attachments.length ? { attachments } : {}),
				}),
			});
			if (!response.ok) {
				console.error("Contact email provider rejected consultation brief", {
					status: response.status,
				});
				return redirectConsultation("error");
			}
			return redirectConsultation(undefined, true);
		}

		if (mode === "direct") {
			const validated = validateDirectContactPayload(formData);
			if (!validated.ok) {
				const error =
					validated.error === "invalid-email"
						? "invalidEmail"
						: "missingFields";
				return redirect(error);
			}
			const token = String(formData.get("cf-turnstile-response") ?? "");
			if (
				!(await verifyTurnstile(
					token,
					request.headers.get("CF-Connecting-IP"),
					getEnv("TURNSTILE_SECRET_KEY"),
				))
			) {
				return redirect("turnstileFailed");
			}

			const text = [
				"New direct contact message from senshac.com",
				`Name: ${validated.name}`,
				`Company: ${validated.company || "Not provided"}`,
				`Email: ${validated.email}`,
				`Phone: ${validated.phone || "Not provided"}`,
				`Message: ${validated.message}`,
				`Language: ${lang}`,
			].join("\n");
			const apiKey = getEnv("RESEND_API_KEY");
			const recipient = resolveContactRecipient(getEnv("CONTACT_EMAIL"));
			if (!apiKey || !recipient) {
				console.error(
					"Contact delivery configuration is incomplete; direct message rejected.",
				);
				return new Response("Contact delivery unavailable", { status: 503 });
			}

			const response = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from: sender,
					to: recipient,
					reply_to: validated.email,
					subject: `New contact message: ${validated.name}`,
					text,
				}),
			});
			if (!response.ok) {
				console.error("Contact email provider rejected direct message", {
					status: response.status,
				});
				return redirect("error");
			}
			return redirect(undefined, true);
		}

		const name = String(formData.get("name") ?? "").trim();
		const company = String(formData.get("company") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const privacyAccepted = formData.get("privacy") === "accepted";
		const businessSituation = String(formData.get("businessSituation") ?? "");
		const desiredService = String(formData.get("desiredService") ?? "");
		if (
			!name ||
			name.length > 200 ||
			!email ||
			email.length > 254 ||
			!privacyAccepted ||
			company.length > 200 ||
			phone.length > 80
		) {
			return redirect(
				"missingFields",
				false,
				businessSituation,
				desiredService,
			);
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return redirect("invalidEmail", false, businessSituation, desiredService);

		const validated = await validateInquiryPayload(t.inquiryPaths, formData);
		if (!validated.ok) {
			if (validated.error === "invalid-config") {
				console.error("Inquiry questionnaire configuration is invalid.");
				return new Response("Inquiry configuration unavailable", {
					status: 500,
				});
			}
			const error =
				validated.error === "invalid-file"
					? "invalidFile"
					: validated.error === "invalid-option" ||
							validated.error === "unknown-path"
						? "invalidSelection"
						: "missingFields";
			return redirect(error, false, businessSituation, desiredService);
		}
		const token = String(formData.get("cf-turnstile-response") ?? "");
		if (
			!(await verifyTurnstile(
				token,
				request.headers.get("CF-Connecting-IP"),
				getEnv("TURNSTILE_SECRET_KEY"),
			))
		) {
			return redirect(
				"turnstileFailed",
				false,
				businessSituation,
				desiredService,
			);
		}

		const selected = t.inquiryPaths.paths.find(
			(path) => path.value === validated.businessSituation,
		);
		if (!selected) {
			console.error(
				"Validated business situation is missing from translations.",
			);
			return new Response("Inquiry configuration unavailable", { status: 500 });
		}
		const questions =
			validated.desiredService === "other-challenge"
				? t.inquiryPaths.alternate
				: selected;
		const answerLines = questions.fields
			.map((field) => {
				const answer = validated.values[field.name];
				if (!answer) return null;
				const option = field.options?.find((item) => item.value === answer);
				return `${field.label}: ${option?.label ?? answer}`;
			})
			.filter(Boolean);
		const text = [
			"New inquiry from senshac.com",
			`Business situation: ${selected.title}`,
			`Desired service: ${validated.serviceLabel}`,
			...(validated.serviceDescription
				? [`Service context: ${validated.serviceDescription}`]
				: []),
			`Name: ${name}`,
			`Company: ${company || "Not provided"}`,
			`Email: ${email}`,
			`Phone: ${phone || "Not provided"}`,
			...answerLines,
			`Language: ${lang}`,
		].join("\n");
		const apiKey = getEnv("RESEND_API_KEY");
		const recipient = resolveContactRecipient(getEnv("CONTACT_EMAIL"));
		if (!apiKey || !recipient) {
			console.error("Contact delivery configuration is incomplete; inquiry rejected.");
			return new Response("Contact delivery unavailable", { status: 503 });
		}

		const attachments = validated.files.map((file) => ({
			filename: file.name,
			content: encodeBase64(file.bytes),
		}));
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: sender,
				to: recipient,
				reply_to: email,
				subject: `New inquiry: ${selected.title}`,
				text,
				...(attachments.length ? { attachments } : {}),
			}),
		});
		if (!response.ok) {
			console.error("Contact email provider rejected inquiry", {
				status: response.status,
			});
			return redirect("error", false, businessSituation, desiredService);
		}
		return redirect(undefined, true, businessSituation, desiredService);
	} catch (error) {
		console.error(
			"Contact submission processing failed",
			error instanceof Error ? error.name : "unknown",
		);
		return redirect("error");
	}
};

export const ALL: APIRoute = () =>
	new Response("Method not allowed", { status: 405 });
