export const prerender = false;

import { ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { APIRoute } from "astro";
import {
	authorized,
	getS3Client,
	allowedMediaOrigin,
	mediaEnv,
	mediaOptions,
	mediaResponse,
	publicMediaUrl,
	safeMediaKey,
} from "../../../../lib/r2-media";

export const OPTIONS: APIRoute = async ({ request, locals }) => {
	const env = mediaEnv(locals);
	if (!(await authorized(request))) {
		return mediaResponse(request, env, { message: "Unauthorized" }, { status: 401 });
	}
	return mediaOptions(request, env);
};

export const GET: APIRoute = async ({ request, locals }) => {
	const env = mediaEnv(locals);
	const origin = request.headers.get("origin");
	if (origin && !allowedMediaOrigin(origin, env)) {
		return mediaResponse(request, env, { message: "Origin not allowed" }, { status: 403 });
	}
	if (!(await authorized(request))) {
		return mediaResponse(request, env, { message: "Unauthorized" }, { status: 401 });
	}
	const url = new URL(request.url);

	// 1. Upload URL generation (always requires S3 presigning)
	const uploadKey = url.searchParams.get("key");
	if (uploadKey) {
		const bucket = env.S3_BUCKET;
		let key: string;
		try {
			key = safeMediaKey(uploadKey);
		} catch {
			return mediaResponse(request, env, { message: "Invalid media key" }, { status: 400 });
		}
		const expiresIn = Number(url.searchParams.get("expiresIn")) || 3600;

		if (import.meta.env.DEV) {
			// Bypass AWS SDK which causes Vite SSR interop issues locally
			return mediaResponse(request, env, {
				signedUrl: `${env.S3_ENDPOINT}/${bucket}/${key}?presigned=true&expiresIn=${expiresIn}`,
				src: publicMediaUrl(key, env.PUBLIC_MEDIA_BASE_URL),
			});
		}

		let client;
		try {
			client = await getS3Client(env);
		} catch (error) {
			console.error("[S3 API Error]:", error);
			return mediaResponse(request, env,
				{
					message: "S3 binding is not configured properly",
					error: String(error),
				},
				{ status: 503 },
			);
		}
		try {
			const command = new PutObjectCommand({ Bucket: bucket, Key: key });
			const signedUrl = await getSignedUrl(client, command, { expiresIn });
			return mediaResponse(request, env, {
				signedUrl,
				src: publicMediaUrl(key, env.PUBLIC_MEDIA_BASE_URL),
			});
		} catch (e) {
			return mediaResponse(request, env,
				{ message: "Failed to create upload URL" },
				{ status: 500 },
			);
		}
	}

	// 2. Listing directory contents
	const directory = url.searchParams.get("directory") || "";
	let prefix = "";
	if (directory) {
		try {
			prefix = `${safeMediaKey(directory).replace(/\/$/, "")}/`;
		} catch {
			return mediaResponse(request, env, { message: "Invalid media directory" }, { status: 400 });
		}
	}
	const limit = Math.min(Number(url.searchParams.get("limit")) || 500, 1000);
	const cursor = url.searchParams.get("offset") || undefined;
	const maxKeys = directory && !cursor ? limit + 1 : limit;

	try {
		// Use native R2 binding if available
		if (env.MEDIA_RAW) {
			const list = await env.MEDIA_RAW.list({
				prefix,
				delimiter: "/",
				limit: maxKeys,
				cursor,
			});

			const directories = list.delimitedPrefixes.map((p: string) => {
				const stripped = p.slice(prefix.length).replace(/\/$/, "");
				return {
					id: p,
					type: "dir",
					filename: stripped,
					directory: directory || "/",
				};
			});

			const objects = list.objects
				.filter((o: any) => o.key !== prefix)
				.map((o: any) => {
					const filename = o.key.split("/").at(-1) || o.key;
					const fullUrl = publicMediaUrl(o.key, env.PUBLIC_MEDIA_BASE_URL);
					return {
						id: o.key,
						filename,
						directory: `/${o.key.split("/").slice(0, -1).join("/")}`,
						src: fullUrl,
						thumbnails: {
							"75x75": fullUrl,
							"400x400": fullUrl,
							"1000x1000": fullUrl,
						},
						type: "file",
					};
				});

			return mediaResponse(request, env, {
				items: [...directories, ...objects],
				offset: list.truncated ? list.cursor : undefined,
			});
		}

		// Fallback to S3 client
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

		const command = new ListObjectsCommand({
			Bucket: env.S3_BUCKET,
			Delimiter: "/",
			Prefix: prefix,
			Marker: cursor,
			MaxKeys: maxKeys,
		});

		const result = await client.send(command);
		console.log("[S3 Mock Debug] Parsed Result:", result);
		const directories = (result.CommonPrefixes || []).map((prefixObj) => {
			const p = prefixObj.Prefix || "";
			const stripped = p.slice(prefix.length).replace(/\/$/, "");
			return {
				id: p,
				type: "dir",
				filename: stripped,
				directory: directory || "/",
			};
		});

		const objects = (result.Contents || [])
			.filter(({ Key }) => Key && Key !== prefix)
			.map(({ Key }) => {
				const k = Key as string;
				const filename = k.split("/").at(-1) || k;
				const fullUrl = publicMediaUrl(k, env.PUBLIC_MEDIA_BASE_URL);
				return {
					id: k,
					filename,
					directory: `/${k.split("/").slice(0, -1).join("/")}`,
					src: fullUrl,
					thumbnails: {
						"75x75": fullUrl,
						"400x400": fullUrl,
						"1000x1000": fullUrl,
					},
					type: "file",
				};
			});

		return mediaResponse(request, env, {
			items: [...directories, ...objects],
			offset: result.NextMarker,
		});
	} catch (e) {
		return mediaResponse(request, env, { message: "Failed to list media" }, { status: 500 });
	}
};
