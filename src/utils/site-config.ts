// src/utils/site-config.ts
import { getEntry } from "astro:content";

type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;

export async function getSiteConfig() {
	const entry = await getEntry("site-config", "site");
	if (!entry) {
		throw new Error("Site configuration not found");
	}
	return {
		...entry.data,
		siteUrl: import.meta.env.PUBLIC_SITE_URL || entry.data.siteUrl,
	};
}
