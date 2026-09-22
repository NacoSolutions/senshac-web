// src/utils/translations.ts
import { getEntry } from "astro:content";

export type Translations = Awaited<ReturnType<typeof getTranslations>>;

export async function getTranslations(lang: string) {
	const entry = await getEntry("translations", lang);
	if (!entry) {
		// Fallback to Spanish
		const fallback = await getEntry("translations", "es");
		if (!fallback) {
			throw new Error(`No translations found for language: ${lang}`);
		}
		return fallback.data;
	}
	return entry.data;
}
