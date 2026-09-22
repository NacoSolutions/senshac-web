import { isUserAuthorized } from "@tinacms/auth";

let cfWorkers: any = null;
try {
	cfWorkers = await import("cloudflare:workers");
} catch (err) {
	// Ignore if cloudflare:workers is not available (e.g. outside CF/Wrangler)
}

export interface RuntimeEnv {
	S3_ENDPOINT?: string;
	S3_ACCESS_KEY?: string;
	S3_SECRET_KEY?: string;
	S3_BUCKET?: string;
	S3_REGION?: string;
	PUBLIC_MEDIA_BASE_URL?: string;
	// Fallback for old bindings if they exist
	R2_UPLOAD_SIGNING_SECRET?: string;
	MEDIA_RAW?: any;
}

export function mediaEnv(_locals: App.Locals) {
	let cfEnv = {} as RuntimeEnv;
	if (cfWorkers?.env) {
		cfEnv = cfWorkers.env as RuntimeEnv;
	}
	const processEnv = typeof process !== "undefined" ? process.env : {};

	// Fallback to process.env for local development (astro dev/bun)
	const resolvedEnv = {
		S3_ENDPOINT:
			cfEnv.S3_ENDPOINT ||
			processEnv.S3_ENDPOINT ||
			import.meta.env.S3_ENDPOINT,
		S3_ACCESS_KEY:
			cfEnv.S3_ACCESS_KEY ||
			processEnv.S3_ACCESS_KEY ||
			import.meta.env.S3_ACCESS_KEY ||
			processEnv.S3_ACCESS_KEY_ID ||
			import.meta.env.S3_ACCESS_KEY_ID,
		S3_SECRET_KEY:
			cfEnv.S3_SECRET_KEY ||
			processEnv.S3_SECRET_KEY ||
			import.meta.env.S3_SECRET_KEY ||
			processEnv.S3_SECRET_ACCESS_KEY ||
			import.meta.env.S3_SECRET_ACCESS_KEY,
		S3_BUCKET:
			cfEnv.S3_BUCKET || processEnv.S3_BUCKET || import.meta.env.S3_BUCKET,
		S3_REGION:
			cfEnv.S3_REGION || processEnv.S3_REGION || import.meta.env.S3_REGION,
		PUBLIC_MEDIA_BASE_URL:
			cfEnv.PUBLIC_MEDIA_BASE_URL ||
			processEnv.PUBLIC_MEDIA_BASE_URL ||
			import.meta.env.PUBLIC_MEDIA_BASE_URL,
		R2_UPLOAD_SIGNING_SECRET:
			cfEnv.R2_UPLOAD_SIGNING_SECRET ||
			processEnv.R2_UPLOAD_SIGNING_SECRET ||
			import.meta.env.R2_UPLOAD_SIGNING_SECRET,
		MEDIA_RAW: cfEnv.MEDIA_RAW,
	} as RuntimeEnv;
	console.log(
		"[S3 Mock Debug] Resolved Env:",
		Object.keys(resolvedEnv).filter((k) => !!(resolvedEnv as any)[k]),
	);
	return resolvedEnv;
}

export async function getS3Client(env: RuntimeEnv) {
	const missing = [];
	if (!env.S3_ACCESS_KEY) missing.push("S3_ACCESS_KEY");
	if (!env.S3_SECRET_KEY) missing.push("S3_SECRET_KEY");
	if (!env.S3_ENDPOINT) missing.push("S3_ENDPOINT");

	if (missing.length > 0) {
		throw new Error(
			`S3 environment variables are missing: ${missing.join(", ")}`,
		);
	}
	const { S3Client } = await import("@aws-sdk/client-s3");
	try {
		return new S3Client({
			region: env.S3_REGION || "auto",
			endpoint: env.S3_ENDPOINT,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY || "",
				secretAccessKey: env.S3_SECRET_KEY || "",
			},
		});
	} catch (err: any) {
		throw new Error(`S3Client constructor failed: ${err.message || err}`);
	}
}

export async function authorized(request: Request) {
	// Allow all local development requests
	if (import.meta.env.DEV) {
		return true;
	}

	const url = new URL(request.url);
	const clientID = url.searchParams.get("clientID");
	const token =
		request.headers.get("authorization") || request.headers.get("authz");
	if (!clientID || !token) return false;

	const user = await isUserAuthorized({ clientID, token });
	return Boolean(user?.verified && user.enabled);
}

export function publicMediaUrl(key: string, baseUrl?: string) {
	const base = (baseUrl || import.meta.env.PUBLIC_MEDIA_BASE_URL || "").replace(
		/\/$/,
		"",
	);
	const cleanKey = key.replace(/^\/+/, "");
	if (/\.woff2$/i.test(cleanKey)) {
		return base
			? `${base}/fonts/${cleanKey.split("/").at(-1)}`
			: `/${cleanKey}`;
	}
	const extensionless = cleanKey
		.replace(/\.[^.]+$/, "")
		.replace(/^(images|videos)\//, "");
	if (/\.(mov|mp4)$/i.test(cleanKey)) {
		return base
			? `${base}/videos/${extensionless}/master.m3u8`
			: `/videos/${extensionless}/master.m3u8`;
	}
	return base
		? `${base}/images/${extensionless}/1280.webp`
		: `/images/${extensionless}`;
}

export function safeMediaKey(value: string) {
	const key = decodeURIComponent(value)
		.replaceAll("\\", "/")
		.replace(/^\/+/, "");
	if (!key || key.includes("../") || key.includes("\0"))
		throw new Error("Invalid media key");
	return key;
}
