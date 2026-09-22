// src/pages/llms.txt.ts

import { getCollection, getEntry } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const siteConfig = await getEntry("site-config", "site");
	if (!siteConfig) {
		return new Response("Site config not found", { status: 500 });
	}

	const site = siteConfig.data;
	const projects = await getCollection("projects");

	// Get unique project slugs (use default locale as primary)
	const projectList = projects
		.filter((p) => p.id.startsWith(`${site.defaultLocale}/`))
		.map(
			(p) =>
				`- [${p.data.title}](${site.siteUrl}/${site.defaultLocale}/works/${p.data.slug})`,
		)
		.join("\n");

	// Build social links section from socialLinks array
	const socialLinks = site.socialLinks
		.map((link) => `- [${link.name}](${link.url})`)
		.join("\n");

	// Build languages section
	const languageLinks = site.locales
		.map((locale) => `- ${locale.toUpperCase()}: ${site.siteUrl}/${locale}/`)
		.join("\n");

	const llmsTxt = `# ${site.company.name} - ${site.company.description}

> ${site.company.tagline}

${site.company.name} is a ${site.contact.location.city}-based interior design studio. Founded by ${site.founder.name}, we create sensory experiences through thoughtful design.

## Contact

- Email: ${site.contact.email}
- Phone: ${site.contact.phone}
- Location: ${site.contact.location.city}, ${site.contact.location.country}

## Pages

- [Home](${site.siteUrl}/${site.defaultLocale}/)
- [Studio](${site.siteUrl}/${site.defaultLocale}/studio)
- [Methods](${site.siteUrl}/${site.defaultLocale}/methods)
- [Works](${site.siteUrl}/${site.defaultLocale}/works)
- [Contact](${site.siteUrl}/${site.defaultLocale}/contact)

## Projects

${projectList}

## Languages

${languageLinks}

## Social

${socialLinks}

## Technical

- Full LLMs Directory: ${site.siteUrl}/llms-full.txt
- Sitemap: ${site.siteUrl}/sitemap.xml
- Robots: ${site.siteUrl}/robots.txt
`;

	return new Response(llmsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
