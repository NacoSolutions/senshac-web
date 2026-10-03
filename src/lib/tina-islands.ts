import type { QueryResult } from "@tinacms/astro";
import type { IslandRegistry } from "@tinacms/astro/experimental";
import type {
	AboutQuery,
	ContactQuery,
	HomeQuery,
	LegalQuery,
	ProjectsQuery,
	ServicesQuery,
	TranslationsQuery,
} from "../../tina/__generated__/types";
import AboutPage from "../components/islands/AboutPage.astro";
import ContactPage from "../components/islands/ContactPage.astro";
import FooterIsland from "../components/islands/FooterIsland.astro";
import HeaderIsland from "../components/islands/HeaderIsland.astro";
import HomePage from "../components/islands/HomePage.astro";
import LegalPage from "../components/islands/LegalPage.astro";
import ProjectPage from "../components/islands/ProjectPage.astro";
import ServicesPage from "../components/islands/ServicesPage.astro";
import {
	getAbout,
	getContact,
	getHome,
	getLegal,
	getPageChromeDocument,
	getProject,
	getServices,
	getSiteConfigTina,
	getTranslations,
	type PageChromeCollection,
	type TinaRuntimeEnv,
} from "./tina-data";
import { resolvePageChrome } from "../utils/page-chrome.mjs";

const pageChromeCollections = new Set([
	"home",
	"about",
	"services",
	"projects",
	"contact",
	"legal",
	"translations",
]);

async function fetchPageSource(pageSource: any, translations: any, env?: TinaRuntimeEnv) {
	if (!pageSource?.collection || !pageSource?.relativePath || !pageSource?.chromePath) {
		return null;
	}
	if (!pageChromeCollections.has(pageSource.collection)) {
		throw new Error(`Unsupported page chrome collection: ${pageSource.collection}`);
	}
	if (pageSource.collection === "translations") {
		return translations?.data?.translations;
	}

	const result = await getPageChromeDocument(
		pageSource.collection as PageChromeCollection,
		pageSource.relativePath,
		env,
	);
	return (result?.data as Record<string, any> | undefined)?.[pageSource.collection];
}

function resolvePageChromeData(pageData: any, pageSource: any, fallback: any) {
	const value = pageSource?.chromePath
		?.split(".")
		.reduce((current: any, key: string) => current?.[key], pageData);
	return value ?? fallback;
}

export function createIslands(env?: TinaRuntimeEnv): IslandRegistry {
	return {
		home: {
			fetch: (_request, params) =>
				getHome(params.get("relativePath") ?? "es/home.json", env),
			component: HomePage,
			wrapper: { tag: "main" },
			propsFromData: (data) => ({
				data: (data as QueryResult<HomeQuery>).data.home,
			}),
		},
		about: {
			fetch: (_request, params) =>
				getAbout(params.get("relativePath") ?? "es/about.json", env),
			component: AboutPage,
			wrapper: { tag: "main", className: "min-h-screen" },
			propsFromData: (data) => ({
				data: (data as QueryResult<AboutQuery>).data.about,
			}),
		},
		services: {
			fetch: (_request, params) =>
				getServices(params.get("relativePath") ?? "es/services.json", env),
			component: ServicesPage,
			wrapper: { tag: "main", className: "min-h-screen" },
			propsFromData: (data) => ({
				data: (data as QueryResult<ServicesQuery>).data.services,
			}),
		},
		project: {
			fetch: (_request, params) =>
				getProject(params.get("relativePath") ?? "es/la-trobada.json", env),
			component: ProjectPage,
			wrapper: { tag: "main", className: "min-h-screen" },
			propsFromData: (data) => ({
				data: (data as QueryResult<ProjectsQuery>).data.projects,
			}),
		},
		header: {
			fetch: async (_request, params) => {
				const pageSource = JSON.parse(params.get("pageSource") ?? "{}");
				const transData = await getTranslations(
					params.get("relativePath") ?? "es.json",
					env,
				);
				const siteData = await getSiteConfigTina("site.json", env);
				const pageData = await fetchPageSource(pageSource, transData, env);
				return { translations: transData, site: siteData, page: pageData };
			},
			component: HeaderIsland,
			wrapper: { tag: "div", className: "relative z-50" },
			propsFromData: (data: any, params) => {
				const pageSource = JSON.parse(params?.get("pageSource") ?? "{}");
				const pageChrome = resolvePageChromeData(
					data?.page,
					pageSource,
					JSON.parse(params?.get("pageChrome") ?? "{}"),
				);
				return {
					data: data?.translations?.data?.translations,
					siteData: data?.site?.data?.siteConfig,
					lang: params?.get("lang") ?? "es",
					headerStyle: pageChrome?.header?.style ?? params?.get("headerStyle") ?? "default",
					chrome: resolvePageChrome(data?.site?.data?.siteConfig?.chrome, pageChrome),
					pageData: data?.page,
					pageChromePath: pageSource?.chromePath,
				};
			},
		},
		footer: {
			fetch: async (_request, params) => {
				const pageSource = JSON.parse(params.get("pageSource") ?? "{}");
				const transData = await getTranslations(
					params.get("relativePath") ?? "es.json",
					env,
				);
				const siteData = await getSiteConfigTina("site.json", env);
				const pageData = await fetchPageSource(pageSource, transData, env);
				return { translations: transData, site: siteData, page: pageData };
			},
			component: FooterIsland,
			wrapper: { tag: "div" },
			propsFromData: (data: any, params) => {
				const pageSource = JSON.parse(params?.get("pageSource") ?? "{}");
				const pageChrome = resolvePageChromeData(
					data?.page,
					pageSource,
					JSON.parse(params?.get("pageChrome") ?? "{}"),
				);
				return {
					data: data?.translations?.data?.translations,
					siteData: data?.site?.data?.siteConfig,
					lang: params?.get("lang") ?? "es",
					chrome: resolvePageChrome(data?.site?.data?.siteConfig?.chrome, pageChrome),
					pageData: data?.page,
					pageChromePath: pageSource?.chromePath,
				};
			},
		},
		contact: {
			fetch: (_request, params) =>
				getContact(params.get("relativePath") ?? "es/contact.json", env),
			component: ContactPage,
			wrapper: { tag: "main", className: "min-h-screen" },
			propsFromData: (data: any, params) => ({
				data: data?.data?.contact,
				siteData: data?.data?.siteConfig,
				lang: params?.get("lang") ?? "es",
			}),
		},
		legal: {
			fetch: (_request, params) =>
				getLegal(params.get("relativePath") ?? "es/privacy-policy.mdx", env),
			component: LegalPage,
			wrapper: { tag: "main", className: "min-h-screen" },
			propsFromData: (data) => ({
				data: (data as QueryResult<LegalQuery>).data.legal,
			}),
		},
	};
}
