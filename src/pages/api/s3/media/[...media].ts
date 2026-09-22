export const prerender = false;

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { APIRoute } from "astro";
import {
	authorized,
	getS3Client,
	mediaEnv,
	safeMediaKey,
} from "../../../../lib/r2-media";

export const DELETE: APIRoute = async ({ request, params, locals }) => {
	if (!(await authorized(request))) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const env = mediaEnv(locals);
	const key = safeMediaKey(params.media || "");

	try {
		if (env.MEDIA_RAW) {
			await env.MEDIA_RAW.delete(key);
			return Response.json({ deleted: key });
		}

		let client;
		try {
			client = await getS3Client(env);
		} catch (error) {
			console.error("[S3 API Error]:", error);
			return Response.json(
				{ message: "S3 binding is not configured properly" },
				{ status: 503 },
			);
		}
		const bucket = env.S3_BUCKET;
		const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
		await client.send(command);
		return Response.json({ deleted: key });
	} catch (error) {
		return Response.json(
			{ message: "Failed to delete media" },
			{ status: 500 },
		);
	}
};
