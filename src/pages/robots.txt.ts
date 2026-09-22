// src/pages/robots.txt.ts

import { getEntry } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const siteConfig = await getEntry("site-config", "site");
	if (!siteConfig) {
		return new Response("Site config not found", { status: 500 });
	}

	const { siteUrl } = siteConfig.data;

	const robotsTxt = `# robots.txt
# AI bot access is enforced by Cloudflare AI Crawl Control at the WAF level.
# Content Signals declare content usage preferences per https://contentsignals.org/

User-agent: *
Allow: /
# Portfolio and design work: no AI training, yes search indexing, yes agent-assisted queries
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Block ad crawlers (not covered by Cloudflare AI Crawl Control)
User-agent: AdsBot-Google
Disallow: /

User-agent: AdsBot
Disallow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# LLMs.txt — machine-readable site index for AI agents
# See: ${siteUrl}/llms.txt
`;

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
