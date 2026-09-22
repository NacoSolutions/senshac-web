import { getCollection } from "astro:content";

export const languages = ["en", "es", "ca"];

export function getLanguagePaths() {
	return languages.map((lang) => ({ params: { lang } }));
}

export async function getProjectPaths() {
	const projects = await getCollection("projects");
	return projects.map((p) => {
		const [lang, ...slugParts] = p.id.split("/");
		return {
			params: { lang, slug: slugParts.join("/") },
		};
	});
}
