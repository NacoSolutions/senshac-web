const PREVIEW_FALLBACK_URL = "https://preview.invalid";

export function resolveSiteUrl(env = process.env) {
	const productionBranch = env.SENSHAC_PRODUCTION_BRANCH || "main";
	const isPagesPreview = Boolean(
		env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== productionBranch,
	);
	const configuredUrl = isPagesPreview
		? env.CF_PAGES_URL || PREVIEW_FALLBACK_URL
		: env.PUBLIC_SITE_URL ||
			(env.CF_PAGES_BRANCH ? PREVIEW_FALLBACK_URL : env.CF_PAGES_URL) ||
			PREVIEW_FALLBACK_URL;

	return new URL(configuredUrl).origin;
}
