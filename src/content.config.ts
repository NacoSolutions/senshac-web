// src/content/config.ts
import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Site configuration (global business info)
const siteConfig = defineCollection({
	loader: glob({ pattern: "site.json", base: "src/content/config" }),
	schema: z.object({
		siteUrl: z.string(),
		locales: z.array(z.string()),
		defaultLocale: z.string(),
		company: z.object({
			name: z.string(),
			legalName: z.string().optional(),
			description: z.any(),
			tagline: z.string().optional(),
		}),
		contact: z.object({
			email: z.string(),
			phone: z.string(),
			phoneLink: z.string().optional(),
			location: z.object({
				city: z.string(),
				country: z.string(),
			}),
		}),
		founder: z.object({
			name: z.string(),
		}),
		socialLinks: z.array(
			z.object({
				name: z.string(),
				url: z.string(),
				icon: z.string(), // UnoCSS icon class, e.g. "i-simple-icons-instagram"
			}),
		),
		attribution: z
			.object({
				design: z.string().optional(),
				development: z.string().optional(),
			})
			.optional(),
		branding: z.object({
			logo: z.string(),
			logoWhite: z.string(),
			symbol: z.string(),
			symbolWhite: z.string(),
			ogImage: z.string(),
		}),
		seo: z
			.object({
				priceRange: z.string().optional(),
			})
			.optional(),
	}),
});

// Home page content
const homePageSchema = z.object({
	title: z.string(),
	description: z.string(),
	headerStyle: z.enum(["default", "transparent"]).default("transparent"),
	blocks: z.array(z.any()).optional(),
});

// About page content
const aboutPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	heroImage: z.string().optional(),
	blocks: z.array(z.any()).optional(),
});

// Services page content
const servicesPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	blocks: z.array(z.any()).optional(),
});

// Contact page content
const contactPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	heading: z.string(),
	subheading: z.string(),
});

// JSON pages collection (home, about, services, contact)
const pagesJson = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "src/content/pages" }),
	schema: z.union([
		homePageSchema,
		aboutPageSchema,
		servicesPageSchema,
		contactPageSchema,
	]),
});

// Legal MDX pages (privacy-policy, legal-notice)
const legal = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/legal" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		lastUpdated: z.coerce.date().optional(),
	}),
});

// Shared schemas for projects
const imageSchema = z.object({
	src: z.string(),
	alt: z.string(),
});

const gallerySchema = z.object({
	cols: z.number().default(2),
	images: z.array(imageSchema),
});

// Project schema
const projectSchema = z.object({
	title: z.string(),
	description: z.string(),
	slug: z.string(),
	publishDate: z.preprocess((val) => {
		if (!val || val === "") return undefined;
		return new Date(val as string);
	}, z.date().optional()),
	completedDate: z.preprocess((val) => {
		if (!val || val === "") return undefined;
		return new Date(val as string);
	}, z.date().optional()),
	tags: z.array(z.string()).default([]),
	showTags: z.boolean().default(false),
	featured: z.boolean().default(false),
	draft: z.boolean().default(false),
	blocks: z.array(z.any()).optional(),
});

const projects = defineCollection({
	loader: glob({
		pattern: "**/*.json",
		base: "src/content/projects",
		// Include language folder in ID to prevent collisions (e.g., "en/la-trobada")
		generateId: ({ entry }) => entry.replace(/\.json$/, ""),
	}),
	schema: projectSchema,
});

const translations = defineCollection({
	loader: glob({ pattern: "*.json", base: "src/content/translations" }),
	schema: z.object({
		nav: z.object({
			social: z.string(),
			menu: z.string(),
			letsTalk: z.string(),
			links: z
				.array(
					z.object({
						label: z.string(),
						href: z.string(),
					}),
				)
				.optional(),
		}),
		footer: z.object({
			privacy: z.string(),
			legal: z.string(),
			links: z
				.array(
					z.object({
						label: z.string(),
						href: z.string(),
					}),
				)
				.optional(),
		}),
		contactForm: z.object({
			name: z.string(),
			company: z.string(),
			email: z.string(),
			phone: z.string(),
			projectType: z.string(),
			projectTypes: z
				.array(
					z.object({
						value: z.string(),
						label: z.string(),
					}),
				)
				.optional(),
			serviceType: z.string(),
			serviceTypes: z
				.array(
					z.object({
						value: z.string(),
						label: z.string(),
					}),
				)
				.optional(),
			message: z.string(),
			privacy: z.string(),
			submit: z.string(),
			sending: z.string(),
			success: z.string(),
			error: z.string(),
			turnstileFailed: z.string(),
			invalidEmail: z.string(),
			missingFields: z.string(),
		}),
		projects: z.object({
			title: z.string(),
			description: z.string(),
			heading: z.string(),
		}),
		accessibility: z.object({
			skipToContent: z.string(),
			selectLanguage: z.string(),
			toggleMenu: z.string(),
			closeMenu: z.string(),
			previousSlide: z.string(),
			nextSlide: z.string(),
			goToSlide: z.string(),
		}),
	}),
});

export const collections = {
	"site-config": siteConfig,
	pages: pagesJson,
	legal,
	projects,
	translations,
};
