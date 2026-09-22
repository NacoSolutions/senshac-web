export const prerender = false;

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { APIRoute } from "astro";
import {
	allowedMediaOrigin,
	authorized,
	getS3Client,
	mediaOptions,
	mediaResponse,
	mediaEnv,
	safeMediaKey,
} from "../../../../lib/r2-media";

export const OPTIONS: APIRoute = async ({ request, locals }) => {
	const env = mediaEnv(locals);
	if (!(await authorized(request))) {
		return mediaResponse(request, env, { message: "Unauthorized" }, { status: 401 });
	}
	return mediaOptions(request, env);
};

export const DELETE: APIRoute = async ({ request, params, locals }) => {
	const env = mediaEnv(locals);
	const origin = request.headers.get("origin");
	if (origin && !allowedMediaOrigin(origin, env)) {
		return mediaResponse(request, env, { message: "Origin not allowed" }, { status: 403 });
	}
	if (!(await authorized(request))) {
		return mediaResponse(request, env, { message: "Unauthorized" }, { status: 401 });
	}
	let key: string;
	try {
		key = safeMediaKey(params.media || "");
	} catch {
		return mediaResponse(request, env, { message: "Invalid media key" }, { status: 400 });
	}

	try {
		if (env.MEDIA_RAW) {
			await env.MEDIA_RAW.delete(key);
			return mediaResponse(request, env, { deleted: key });
		}

		let client;
		try {
			client = await getS3Client(env);
		} catch (error) {
			console.error("[S3 API Error]:", error);
			return mediaResponse(request, env,
				{ message: "S3 binding is not configured properly" },
				{ status: 503 },
			);
		}
		const bucket = env.S3_BUCKET;
		const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
		await client.send(command);
		return mediaResponse(request, env, { deleted: key });
	} catch (error) {
		return mediaResponse(request, env,
			{ message: "Failed to delete media" },
			{ status: 500 },
		);
	}
};
