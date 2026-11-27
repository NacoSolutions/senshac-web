export interface InquiryField {
	name: string;
	kind: "text" | "textarea" | "select" | "file";
	required: boolean;
	options?: Array<{ value: string; label: string }>;
}

export interface InquiryPath {
	value: string;
	serviceOptions: InquiryService[];
	fields: InquiryField[];
}

export interface InquiryService {
	value:
		| "integral"
		| "decorative-restyling"
		| "strategic-consultation"
		| "other-challenge";
	label: string;
	description: string;
}

export interface InquiryConfig {
	paths: InquiryPath[];
	alternate: { fields: InquiryField[] };
}

export type DirectContactPayloadResult =
	| {
			ok: true;
			mode: "direct";
			name: string;
			company: string;
			email: string;
			phone: string;
			message: string;
	  }
	| {
			ok: false;
			error:
				| "duplicate-field"
				| "unknown-field"
				| "invalid-mode"
				| "missing-field"
				| "field-too-long"
				| "invalid-email";
	  };

export type InquiryPayloadResult =
	| {
			ok: true;
			businessSituation: string;
			desiredService: string;
			serviceLabel: string;
			serviceDescription: string;
			values: Record<string, string>;
			files: Array<{ name: string; type: string; bytes: Uint8Array }>;
	  }
	| { ok: false; error: string };

export type ConsultationPayloadResult =
	| {
			ok: true;
			mode: "consultation";
			name: string;
			email: string;
			phone: string;
			company: string;
			message: string;
			files: Array<{ name: string; type: string; bytes: Uint8Array }>;
	  }
	| { ok: false; error: string };

export function validateDirectContactPayload(
	formData: FormData,
): DirectContactPayloadResult;

export function parseBoundedFormData(
	request: Request,
	maxBytes: number,
): Promise<
	| { ok: true; formData: FormData }
	| { ok: false; error: "body-too-large" | "invalid-form" }
>;

export function validateInquiryPayload(
	inquiry: InquiryConfig,
	formData: FormData,
): Promise<InquiryPayloadResult>;

export function validateConsultationPayload(
	formData: FormData,
): Promise<ConsultationPayloadResult>;
