// src/pages/sitemap.xml.ts

import { getCollection, getEntry } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const siteConfig = await getEntry("site-config", "site");
	if (!siteConfig) {
		return new Response("Site config not found", { status: 500 });
	}

	const { siteUrl, locales } = siteConfig.data;
	const projects = await getCollection("projects");

	const urls: string[] = [];

	// Static pages per locale
	const staticPages = [
		"",
		"/studio",
		"/methods",
		"/contact",
		"/works",
		"/legal-notice",
		"/privacy-policy",
	];

	for (const locale of locales) {
		for (const page of staticPages) {
			const loc = `${siteUrl}/${locale}${page}`;
			const lastmod = new Date().toISOString().split("T")[0];
			const priority = page === "" ? "1.0" : page === "/works" ? "0.9" : "0.8";

			// Build xhtml:link alternates
			const alternates = locales
				.map((alt) => {
					const href = `${siteUrl}/${alt}${page}`;
					return `<xhtml:link rel="alternate" hreflang="${alt}" href="${href}" />`;
				})
				.join("\n      ");

			urls.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page === "" ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
    ${alternates}
  </url>`);
		}
	}

	// Project pages
	const projectSlugs = [...new Set(projects.map((p) => p.data.slug))];

	for (const slug of projectSlugs) {
		for (const locale of locales) {
			const project = projects.find(
				(p) =>
					p.id === `${locale}/${slug}` ||
					(p.id.startsWith(`${locale}/`) && p.data.slug === slug),
			);
			if (!project) continue;

			const loc = `${siteUrl}/${locale}/works/${slug}`;
			const lastmod = project.data.publishDate
				? new Date(project.data.publishDate).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0];

			const alternates = locales
				.map((alt) => {
					const href = `${siteUrl}/${alt}/works/${slug}`;
					return `<xhtml:link rel="alternate" hreflang="${alt}" href="${href}" />`;
				})
				.join("\n      ");

			urls.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    ${alternates}
  </url>`);
		}
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("")}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
