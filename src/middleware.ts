// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { NodeHtmlMarkdown } from "node-html-markdown";

export const onRequest = defineMiddleware(async (context, next) => {
	const url = new URL(context.request.url);
	const acceptsMarkdown =
		context.request.headers.get("Accept")?.includes("text/markdown") ?? false;
	const canUseEdgeCache =
		context.request.method === "GET" &&
		!context.request.headers.has("cookie") &&
		!acceptsMarkdown &&
		!url.pathname.startsWith("/api/") &&
		!url.pathname.startsWith("/admin") &&
		!url.pathname.startsWith("/tina");
	const edgeCache = (
		globalThis as typeof globalThis & { caches?: { default?: any } }
	).caches?.default;
	const edgeCacheUrl = new URL(context.request.url);
	edgeCacheUrl.searchParams.set(
		"__senshac_deployment",
		import.meta.env.SENSHAC_DEPLOYMENT_VERSION ?? "development",
	);
	const edgeCacheKey = new Request(edgeCacheUrl, context.request);

	if (canUseEdgeCache && edgeCache) {
		const cached = await edgeCache.match(edgeCacheKey);
		if (cached) {
			const headers = new Headers(cached.headers);
			headers.set("X-Senshac-Cache", "HIT");
			return new Response(cached.body, {
				status: cached.status,
				statusText: cached.statusText,
				headers,
			});
		}
	}
	const isBuild =
		typeof process !== "undefined" &&
		(process.env.npm_lifecycle_event === "build" ||
			!!process.env.ASTRO_CONFIG_FILE);
	const acceptHeader = !isBuild
		? context.request.headers.get("Accept") || ""
		: "";

	let isMarkdownExt = false;
	let originalPath = url.pathname;

	// Handle /.md or /index.md
	if (url.pathname.endsWith(".md")) {
		isMarkdownExt = true;
		// Strip .md or index.md to get the actual HTML route
		originalPath = url.pathname.replace(/(\/index)?\.md$/, "");
		if (originalPath === "") originalPath = "/";
	} else if (url.pathname.endsWith(".md/")) {
		isMarkdownExt = true;
		originalPath = url.pathname.replace(/(\/index)?\.md\/$/, "");
		if (originalPath === "") originalPath = "/";
	}

	const isMarkdownAccept = acceptHeader.includes("text/markdown");
	const shouldServeMarkdown = isMarkdownExt || isMarkdownAccept;

	let response: Response;

	if (isMarkdownExt) {
		// Astro 4+ allows rewriting via context.rewrite!
		response = await context.rewrite(originalPath);
	} else {
		// If no extension, we process the response
		response = await next();
	}

	// Add Link headers for agent discovery (RFC 8288) to all responses
	response.headers.append("Link", '</llms.txt>; rel="describedby"');

	if (
		shouldServeMarkdown &&
		response.headers.get("Content-Type")?.includes("text/html")
	) {
		const html = await response.text();

		// Extract metadata for YAML frontmatter
		const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
		const descMatch = html.match(
			/<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/?>/i,
		);
		const canonicalMatch = html.match(
			/<link\s+rel="canonical"\s+href="([\s\S]*?)"\s*\/?>/i,
		);

		let frontmatter = "---\n";
		if (titleMatch)
			frontmatter += `title: "${titleMatch[1].trim().replace(/"/g, '\\"')}"\n`;
		if (descMatch)
			frontmatter += `description: "${descMatch[1].trim().replace(/"/g, '\\"')}"\n`;
		if (canonicalMatch) frontmatter += `url: "${canonicalMatch[1].trim()}"\n`;
		frontmatter += "---\n\n";

		// Extract main content to reduce boilerplate
		let mainHtml = html;
		const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
		if (mainMatch) {
			mainHtml = mainMatch[1];
		} else {
			const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			if (bodyMatch) mainHtml = bodyMatch[1];
		}

		// Convert relative URLs to absolute before converting to Markdown
		mainHtml = mainHtml.replace(/href="\/(?!\/)/g, `href="${url.origin}/`);
		mainHtml = mainHtml.replace(/src="\/(?!\/)/g, `src="${url.origin}/`);

		const markdown = NodeHtmlMarkdown.translate(mainHtml);

		return new Response(frontmatter + markdown, {
			status: response.status,
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"Cache-Control":
					response.headers.get("Cache-Control") || "public, max-age=60",
				Link: response.headers.get("Link") || '</llms.txt>; rel="describedby"',
			},
		});
	}

	const isPublicHtmlGet =
		context.request.method === "GET" &&
		response.headers.get("Content-Type")?.includes("text/html") &&
		!url.pathname.startsWith("/api/") &&
		!url.pathname.startsWith("/admin") &&
		!url.pathname.startsWith("/tina");
	const isPrerenderedHome = /^\/(?:es|en|ca)\/$/.test(url.pathname);
	if (
		isPublicHtmlGet &&
		(isPrerenderedHome || !response.headers.has("Cache-Control"))
	) {
		response.headers.set(
			"Cache-Control",
			"public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
		);
	}
	if (
		canUseEdgeCache &&
		edgeCache &&
		response.status === 200 &&
		isPublicHtmlGet
	) {
		const cacheResponse = response.clone();
		cacheResponse.headers.set(
			"Cache-Control",
			"public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
		);
		await edgeCache.put(edgeCacheKey, cacheResponse);
		response.headers.set("X-Senshac-Cache", "MISS");
	}

	return response;
});
