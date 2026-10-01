export interface InquiryField {
	name: string;
	kind: "text" | "textarea" | "select" | "file";
	required: boolean;
	options?: Array<{ value: string; label: string }>;
}

export interface InquiryPath {
	value: string;
	fields: InquiryField[];
}

export type InquiryPayloadResult =
	| {
			ok: true;
			path: string;
			servicePackage?: "consultation" | "decorative" | "integral";
			values: Record<string, string>;
			files: Array<{ name: string; type: string; bytes: Uint8Array }>;
	  }
	| { ok: false; error: string };

export function parseBoundedFormData(
	request: Request,
	maxBytes: number,
): Promise<
	| { ok: true; formData: FormData }
	| { ok: false; error: "body-too-large" | "invalid-form" }
>;

export function validateInquiryPayload(
	paths: InquiryPath[],
	formData: FormData,
): Promise<InquiryPayloadResult>;
