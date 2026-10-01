export const prerender = false;

import { getEntry } from "astro:content";
import type { APIRoute } from "astro";
import {
	parseBoundedFormData,
	validateInquiryPayload,
} from "../../../utils/inquiry-contract.mjs";
import { findServicePackage } from "../../../utils/service-packages.mjs";

const MAX_REQUEST_BYTES = 12 * 1024 * 1024;

async function verifyTurnstile(
	token: string,
	ip: string | null,
): Promise<boolean> {
	const secretKey = import.meta.env.TURNSTILE_SECRET_KEY;
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

function safeReturnUrl(request: Request, lang: string): URL {
	const fallback = new URL(`/${lang}/contact`, request.url);
	const referer = request.headers.get("Referer");
	if (!referer) return fallback;
	try {
		const candidate = new URL(referer);
		return candidate.origin === new URL(request.url).origin &&
			candidate.pathname === `/${lang}/contact`
			? candidate
			: fallback;
	} catch {
		return fallback;
	}
}

export const POST: APIRoute = async ({ request, params }) => {
	const lang = params.lang || "es";
	const translations = await getEntry("translations", lang);
	if (!translations)
		return new Response("Translations not found", { status: 500 });
	const t = translations.data.contactForm;
	const returnUrl = safeReturnUrl(request, lang);
	const redirect = (error?: string, success = false, inquiryPath?: string) => {
		returnUrl.searchParams.delete("contact_error");
		returnUrl.searchParams.delete("contact_success");
		if (error) returnUrl.searchParams.set("contact_error", error);
		if (success) returnUrl.searchParams.set("contact_success", "1");
		if (
			inquiryPath &&
			["first-space", "existing-space", "growth"].includes(inquiryPath)
		) {
			returnUrl.searchParams.set("path", inquiryPath);
		}
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
		const name = String(formData.get("name") ?? "").trim();
		const company = String(formData.get("company") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const privacyAccepted = formData.get("privacy") === "accepted";
		const inquiryPath = String(formData.get("inquiryPath") ?? "");
		if (
			!name ||
			name.length > 200 ||
			!email ||
			email.length > 254 ||
			!privacyAccepted ||
			company.length > 200 ||
			phone.length > 80
		) {
			return redirect("missingFields", false, inquiryPath);
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return redirect("invalidEmail", false, inquiryPath);

		const validated = await validateInquiryPayload(
			t.inquiryPaths.paths,
			formData,
		);
		if (!validated.ok) {
			const error =
				validated.error === "invalid-file" ? "invalidFile" : "missingFields";
			return redirect(error, false, inquiryPath);
		}
		const token = String(formData.get("cf-turnstile-response") ?? "");
		if (
			!(await verifyTurnstile(token, request.headers.get("CF-Connecting-IP")))
		) {
			return redirect("turnstileFailed", false, inquiryPath);
		}

		const selected = t.inquiryPaths.paths.find(
			(path) => path.value === validated.path,
		);
		if (!selected) {
			console.error("Validated inquiry path is missing from translations.");
			return new Response("Inquiry configuration unavailable", { status: 500 });
		}
		const servicePackage = validated.servicePackage
			? findServicePackage(
					(await getEntry("pages", `${lang}/services`))?.data.blocks,
					lang,
					validated.servicePackage,
				)
			: null;
		if (validated.servicePackage && !servicePackage) {
			console.error("Validated service package is missing from localized methods content.");
			return new Response("Inquiry configuration unavailable", { status: 500 });
		}
		const answerLines = selected.fields
			.map((field) => {
				const answer = validated.values[field.name];
				if (!answer) return null;
				const option = field.options?.find((item) => item.value === answer);
				return `${field.label}: ${option?.label ?? answer}`;
			})
			.filter(Boolean);
		const text = [
			"New inquiry from senshac.com",
			`Path: ${selected.title}`,
			...(servicePackage ? [`Service package: ${servicePackage.title}`] : []),
			`Name: ${name}`,
			`Company: ${company || "Not provided"}`,
			`Email: ${email}`,
			`Phone: ${phone || "Not provided"}`,
			...answerLines,
			`Language: ${lang}`,
		].join("\n");
		const apiKey = import.meta.env.RESEND_API_KEY;
		if (!apiKey) {
			console.error("Contact email is not configured; inquiry rejected.");
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
				from: "Senshac Web <noreply@senshac.com>",
				to: import.meta.env.CONTACT_EMAIL || "info@senshac.com",
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
			return redirect("error", false, inquiryPath);
		}
		return redirect(undefined, true, inquiryPath);
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
