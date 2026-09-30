// src/content/config.ts
import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

const appearancePreset = z.enum([
	"transparent-adaptive",
	"transparent-light",
	"transparent-dark",
	"opaque-light",
	"opaque-dark",
]);

const chromePart = z.object({
	mode: z.enum(["fixed", "scrolling"]),
	atFinal: appearancePreset,
	scrolling: appearancePreset,
});

const blockNames = [
	"accordion",
	"banner",
	"callout",
	"carousel",
	"credits",
	"details",
	"feed",
	"form",
	"gallery",
	"hero",
	"list",
	"media",
	"showcase",
	"statement",
	"text",
] as const;
const blockFields: Record<(typeof blockNames)[number], readonly string[]> = {
	accordion: ["intro", "items"],
	banner: [
		"title",
		"subtitle",
		"topRight",
		"mediaId",
		"imageAlt",
		"placeholderLabel",
		"objectFit",
	],
	callout: ["text", "link"],
	carousel: ["items"],
	credits: ["title", "list"],
	details: [
		"title",
		"subtitle",
		"mediaId",
		"services",
		"servicesLabel",
		"category",
		"categoryLabel",
		"area",
		"areaLabel",
		"location",
		"locationLabel",
	],
	feed: ["title", "description", "tag", "limit", "maxVisible"],
	form: ["heading", "subheading", "mediaId"],
	gallery: ["cols", "images"],
	hero: [
		"title",
		"intro",
		"ctaText",
		"ctaLink",
		"mediaType",
		"mediaId",
		"imageAlt",
		"placeholderLabel",
		"objectFit",
	],
	list: ["title", "intro", "items"],
	media: ["variant", "mediaId", "alt"],
	showcase: [
		"eyebrow",
		"title",
		"mediaType",
		"mediaId",
		"imageAlt",
		"placeholderLabel",
		"ctaText",
		"ctaLink",
		"items",
	],
	statement: [
		"label",
		"content",
		"statement",
		"mediaId",
		"imageAlt",
		"placeholderLabel",
	],
	text: ["eyebrow", "title", "headingLevel", "variant", "body", "showStar"],
};

const contentBlock = z
	.object({ _template: z.enum(blockNames), variant: z.string().optional() })
	.passthrough()
	.superRefine((block, context) => {
		const allowedFields = new Set([
			"_template",
			...blockFields[block._template],
		]);
		for (const field of Object.keys(block)) {
			if (!allowedFields.has(field)) {
				context.addIssue({
					code: "custom",
					path: [field],
					message: `unsupported ${block._template} field ${field}`,
				});
			}
		}
		if (block._template === "list" && Array.isArray(block.items)) {
			for (const [index, item] of block.items.entries()) {
				if (item && typeof item === "object") {
					for (const key of Object.keys(item)) {
						if (!["title", "text", "href"].includes(key)) {
							context.addIssue({
								code: "custom",
								path: ["items", index, key],
								message: `unsupported list item field ${key}`,
							});
						}
					}
					if (
						"href" in item &&
						typeof item.href === "string" &&
						!/^\/(?!\/)|^https:\/\/\S+$/.test(item.href)
					) {
						context.addIssue({
							code: "custom",
							path: ["items", index, "href"],
							message: "list links must be local paths or HTTPS URLs",
						});
					}
				} else {
					context.addIssue({
						code: "custom",
						path: ["items", index],
						message: "list items must be objects",
					});
				}
			}
		}
		const variants: readonly string[] | undefined =
			block._template === "media"
				? ["banner", "full"]
				: block._template === "text"
					? ["brief", "concept", "strategy"]
					: undefined;
		if (
			block._template === "media" &&
			!variants?.includes(block.variant ?? "")
		) {
			context.addIssue({
				code: "custom",
				path: ["variant"],
				message: "media requires variant banner or full",
			});
		}
		if (
			block._template === "text" &&
			block.variant &&
			!variants?.includes(block.variant)
		) {
			context.addIssue({
				code: "custom",
				path: ["variant"],
				message: "text variant must be brief, concept, or strategy",
			});
		}
		if (!variants && block.variant) {
			context.addIssue({
				code: "custom",
				path: ["variant"],
				message: `${block._template} does not support a variant`,
			});
		}
	});

// Site configuration (global business info)
const siteConfig = defineCollection({
	loader: glob({ pattern: "site.json", base: "src/content/config" }),
	schema: z.object({
		chrome: z.object({ header: chromePart, footer: chromePart }).optional(),
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
	blocks: z.array(contentBlock),
});

// About page content
const aboutPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	heroImage: z.string().optional(),
	blocks: z.array(contentBlock),
});

// Services page content
const servicesPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	blocks: z.array(contentBlock),
});

// Contact page content
const contactPageSchema = z.object({
	title: z.string(),
	description: z.string(),
	heading: z.string(),
	subheading: z.string(),
	blocks: z.array(contentBlock),
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
	blocks: z.array(contentBlock),
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

const inquiryOption = z
	.object({ value: z.string().min(1), label: z.string().min(1) })
	.strict();
const inquiryField = z
	.object({
		name: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
		kind: z.enum(["text", "textarea", "select", "file"]),
		label: z.string().min(1),
		required: z.boolean(),
		options: z.array(inquiryOption).optional(),
	})
	.strict()
	.superRefine((field, context) => {
		if (
			field.kind === "select" &&
			(!field.options || field.options.length === 0)
		) {
			context.addIssue({
				code: "custom",
				path: ["options"],
				message: "select fields require options",
			});
		}
		if (field.kind !== "select" && field.options) {
			context.addIssue({
				code: "custom",
				path: ["options"],
				message: "only select fields support options",
			});
		}
	});
const inquiryPath = z
	.object({
		value: z.enum(["first-space", "existing-space", "growth"]),
		title: z.string().min(1),
		description: z.string().min(1),
		fields: z.array(inquiryField).min(1),
	})
	.strict();

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
			inquiryPaths: z
				.object({
					heading: z.string().min(1),
					chooseLabel: z.string().min(1),
					paths: z.array(inquiryPath).length(3),
				})
				.strict(),
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
			invalidFile: z.string(),
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
