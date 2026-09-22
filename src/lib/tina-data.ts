import { requestWithMetadata } from "@tinacms/astro";
import { createClient } from "tinacms/dist/client";
import {
	type AboutQuery,
	type ContactQuery,
	type HomeQuery,
	type LegalQuery,
	type ProjectsQuery,
	queries,
	type ServicesQuery,
	type SiteConfigQuery,
	type TranslationsQuery,
} from "../../tina/__generated__/types";

export interface TinaRuntimeEnv {
	TINA_BRANCH?: string;
	CF_PAGES_BRANCH?: string;
	TINA_CLIENT_ID?: string;
	TINA_TOKEN?: string;
}

export function getTinaRuntimeEnv(
	_locals: App.Locals,
): TinaRuntimeEnv | undefined {
	// Astro 6 removed Astro.locals.runtime.env
	// Variables are handled via import.meta.env fallbacks in getClient
	return undefined;
}

function getClient(env?: TinaRuntimeEnv) {
	// Use local GraphQL server during development
	if (import.meta.env.DEV) {
		return createClient({
			url: "http://localhost:4001/graphql",
			// @ts-expect-error - TinaClientArgs type mismatch
			clientId: "",
			token: "",
			queries,
		});
	}

	const branch =
		env?.TINA_BRANCH ||
		env?.CF_PAGES_BRANCH ||
		import.meta.env.TINA_BRANCH ||
		import.meta.env.CF_PAGES_BRANCH ||
		(typeof process !== "undefined"
			? process.env.TINA_BRANCH || process.env.CF_PAGES_BRANCH
			: undefined) ||
		"main";
	const clientId =
		env?.TINA_CLIENT_ID ||
		import.meta.env.TINA_CLIENT_ID ||
		(typeof process !== "undefined" ? process.env.TINA_CLIENT_ID : undefined) ||
		"";
	const token =
		env?.TINA_TOKEN ||
		import.meta.env.TINA_TOKEN ||
		(typeof process !== "undefined" ? process.env.TINA_TOKEN : undefined) ||
		"";

	return createClient({
		url: `https://content.tinajs.io/2.4/content/${clientId}/github/${branch}`,
		token,
		queries,
	});
}

export function pageRelativePath(lang: string | undefined, filename: string) {
	return `${lang || "es"}/${filename}`;
}

const requestCache = new Map<string, Promise<any>>();

export function getHome(relativePath: string, env?: TinaRuntimeEnv) {
	const key = `home-${relativePath}`;
	if (!requestCache.has(key)) {
		requestCache.set(
			key,
			requestWithMetadata<HomeQuery>(
				getClient(env).queries.home({ relativePath }),
				{ priority: "primary" },
			),
		);
	}
	return requestCache.get(key)!;
}

export function getAbout(relativePath: string, env?: TinaRuntimeEnv) {
	return requestWithMetadata<AboutQuery>(
		getClient(env).queries.about({ relativePath }),
		{ priority: "primary" },
	);
}

export function getServices(relativePath: string, env?: TinaRuntimeEnv) {
	return requestWithMetadata<ServicesQuery>(
		getClient(env).queries.services({ relativePath }),
		{ priority: "primary" },
	);
}

export function getProject(relativePath: string, env?: TinaRuntimeEnv) {
	return requestWithMetadata<ProjectsQuery>(
		getClient(env).queries.projects({ relativePath }),
		{ priority: "primary" },
	);
}

export function getTranslations(relativePath: string, env?: TinaRuntimeEnv) {
	const key = `translations-${relativePath}`;
	if (!requestCache.has(key)) {
		requestCache.set(
			key,
			requestWithMetadata<TranslationsQuery>(
				getClient(env).queries.translations({ relativePath }),
				{ priority: "primary" },
			),
		);
	}
	const cached = requestCache.get(key);
	if (!cached) {
		throw new Error(`Missing Tina request cache entry: ${key}`);
	}
	return cached;
}

export function getContact(relativePath: string, env?: TinaRuntimeEnv) {
	return requestWithMetadata<ContactQuery>(
		getClient(env).queries.contact({ relativePath }),
		{ priority: "primary" },
	);
}

export function getLegal(relativePath: string, env?: TinaRuntimeEnv) {
	return requestWithMetadata<LegalQuery>(
		getClient(env).queries.legal({ relativePath }),
		{ priority: "primary" },
	);
}

export function getSiteConfigTina(relativePath: string, env?: TinaRuntimeEnv) {
	const key = `siteconfig-${relativePath}`;
	if (!requestCache.has(key)) {
		requestCache.set(
			key,
			requestWithMetadata<SiteConfigQuery>(
				getClient(env).queries.siteConfig({ relativePath }),
				{ priority: "primary" },
			),
		);
	}
	const cached = requestCache.get(key);
	if (!cached) {
		throw new Error(`Missing Tina request cache entry: ${key}`);
	}
	return cached;
}
