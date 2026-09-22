// tina/config.ts
import { defineConfig, type TinaField } from "tinacms";

// ============================================================================
// SHARED FIELD DEFINITIONS
// ============================================================================

// R2 media identifier field object (for nested use)
const imageFields: TinaField[] = [
	{ type: "image" as const, name: "mediaId", label: "R2 Media Identifier" },
	{ type: "string" as const, name: "alt", label: "Alt Text" },
];

// Gallery field object (for nested use)
const galleryFields: TinaField[] = [
	{ type: "number" as const, name: "cols", label: "Columns" },
	{
		type: "object" as const,
		name: "images",
		label: "Images",
		list: true,
		fields: imageFields,
	},
];

// ============================================================================
// SITE CONFIG FIELDS
// ============================================================================

const siteConfigFields: TinaField[] = [
	{ type: "string" as const, name: "siteUrl", label: "Site URL" },
	{ type: "string" as const, name: "locales", label: "Locales", list: true },
	{ type: "string" as const, name: "defaultLocale", label: "Default Locale" },
	{
		type: "object" as const,
		name: "company",
		label: "Company",
		fields: [
			{ name: "name", label: "Name", type: "string" },
			{ name: "legalName", label: "Legal Name", type: "string" },
			{
				name: "description",
				label: "Description",
				type: "string",
				ui: { component: "textarea" },
			},
			{ name: "tagline", label: "Tagline", type: "string" },
		],
	},
	{
		type: "object" as const,
		name: "contact",
		label: "Contact",
		fields: [
			{ name: "email", label: "Email", type: "string" },
			{ name: "phone", label: "Phone", type: "string" },
			{ name: "phoneLink", label: "Phone Link (no spaces)", type: "string" },
			{
				type: "object" as const,
				name: "location",
				label: "Location",
				fields: [
					{ name: "city", label: "City", type: "string" },
					{ name: "country", label: "Country Code", type: "string" },
				],
			},
		],
	},
	{
		type: "object" as const,
		name: "founder",
		label: "Founder",
		fields: [{ name: "name", label: "Name", type: "string" }],
	},
	{
		type: "object" as const,
		name: "socialLinks",
		label: "Social Links",
		list: true,
		fields: [
			{ name: "name", label: "Name", type: "string" },
			{ name: "url", label: "URL", type: "string" },
			{
				name: "icon",
				label: "Icon (Iconify)",
				type: "string",
				required: true,
				description:
					'UnoCSS icon class, e.g. "i-simple-icons-instagram" or "i-mdi-linkedin"',
			},
		],
	},
	{
		type: "object" as const,
		name: "attribution",
		label: "Attribution",
		fields: [
			{ name: "design", label: "Design By", type: "string" },
			{ name: "development", label: "Development By", type: "string" },
		],
	},
	{
		type: "object" as const,
		name: "branding",
		label: "Branding",
		fields: [
			{ name: "logo", label: "Logo Media ID", type: "image" },
			{ name: "logoWhite", label: "White Logo Media ID", type: "image" },
			{ name: "symbol", label: "Symbol Media ID", type: "image" },
			{ name: "symbolWhite", label: "White Symbol Media ID", type: "image" },
			{ name: "ogImage", label: "Default OG Media ID", type: "image" },
		],
	},
	{
		type: "object" as const,
		name: "seo",
		label: "SEO",
		fields: [{ name: "priceRange", label: "Price Range", type: "string" }],
	},
];

// ============================================================================
// BLOCK TEMPLATES
// ============================================================================

const contactFormBlock: TinaField = {
	name: "contactForm",
	label: "Contact Form Layout",
	type: "object",
	fields: [
		{ type: "image", name: "mediaId", label: "R2 Media Identifier" },
		{ type: "string", name: "heading", label: "Heading" },
		{ type: "string", name: "subheading", label: "Subheading" },
	],
};

const editorialHeroBlock: TinaField = {
	name: "editorialHero",
	label: "Editorial Hero",
	type: "object",
	fields: [
		{
			name: "title",
			label: "Title",
			type: "string",
			ui: { component: "textarea" },
		},
		{ name: "intro", label: "Introduction", type: "rich-text" },
		{ name: "ctaText", label: "Link Text", type: "string" },
		{ name: "ctaLink", label: "Link URL", type: "string" },
		{
			name: "mediaType",
			label: "Media Type",
			type: "string",
			options: ["image", "video"],
		},
		{ name: "mediaId", label: "R2 Media Identifier", type: "image" },
		{ name: "imageAlt", label: "Image Alt Text", type: "string" },
		{ name: "placeholderLabel", label: "Placeholder Label", type: "string" },
		{
			name: "objectFit",
			label: "Image Fit",
			type: "string",
			options: ["cover", "contain"],
		},
	],
};

const editorialBannerBlock: TinaField = {
	name: "editorialBanner",
	label: "Editorial Banner",
	type: "object",
	fields: [
		{
			name: "title",
			label: "Title",
			type: "string",
			ui: { component: "textarea" },
		},
		{ name: "subtitle", label: "Subtitle", type: "string" },
		{
			name: "topRight",
			label: "Top Right Slogan",
			type: "object",
			fields: [{ name: "lines", label: "Lines", type: "string", list: true }],
		},
		{ name: "mediaId", label: "R2 Media Identifier", type: "image" },
		{ name: "imageAlt", label: "Image Alt Text", type: "string" },
		{ name: "placeholderLabel", label: "Placeholder Label", type: "string" },
		{
			name: "objectFit",
			label: "Image Fit",
			type: "string",
			options: ["cover", "contain"],
		},
	],
};

const editorialCopyBlock: TinaField = {
	name: "editorialCopy",
	label: "Editorial Copy",
	type: "object",
	fields: [
		{ name: "eyebrow", label: "Eyebrow", type: "string" },
		{
			name: "title",
			label: "Title",
			type: "string",
			ui: { component: "textarea" },
		},
		{
			name: "headingLevel",
			label: "Heading Level",
			type: "string",
			options: ["h1", "h2"],
		},
		{ name: "body", label: "Body", type: "rich-text" },
		{ name: "showStar", label: "Show Star Graphic", type: "boolean" },
	],
};

const editorialAccordionBlock: TinaField = {
	name: "editorialAccordion",
	label: "Editorial Accordion",
	type: "object",
	fields: [
		{ name: "intro", label: "Introduction", type: "rich-text" },
		{
			name: "items",
			label: "Accordion Items",
			type: "object",
			list: true,
			ui: {
				itemProps: (item) => ({
					label: `${item?.number || ""} ${item?.title || ""}`.trim(),
				}),
			},
			fields: [
				{ name: "number", label: "Number", type: "string" },
				{ name: "title", label: "Title", type: "string" },
				{
					name: "summary",
					label: "Summary",
					type: "string",
					ui: { component: "textarea" },
				},
				{ name: "open", label: "Open by Default", type: "boolean" },
				{
					name: "details",
					label: "Expanded Details",
					type: "object",
					list: true,
					ui: { itemProps: (item) => ({ label: item?.label }) },
					fields: [
						{ name: "label", label: "Label", type: "string" },
						{ name: "text", label: "Text", type: "rich-text" },
					],
				},
			],
		},
	],
};

const editorialRowsBlock: TinaField = {
	name: "editorialRows",
	label: "Editorial Rows",
	type: "object",
	fields: [
		{
			name: "title",
			label: "Title",
			type: "string",
			ui: { component: "textarea" },
		},
		{ name: "intro", label: "Introduction", type: "rich-text" },
		{
			name: "items",
			label: "Rows",
			type: "object",
			list: true,
			ui: { itemProps: (item) => ({ label: item?.title }) },
			fields: [
				{ name: "title", label: "Title", type: "string" },
				{ name: "text", label: "Text", type: "rich-text" },
			],
		},
	],
};

const editorialCtaBlock: TinaField = {
	name: "editorialCta",
	label: "Editorial Call to Action",
	type: "object",
	fields: [
		{ name: "text", label: "Text", type: "string" },
		{ name: "link", label: "URL", type: "string" },
	],
};

const editorialShowcaseBlock: TinaField = {
	name: "editorialShowcase",
	label: "Editorial Media / Work Showcase",
	type: "object",
	fields: [
		{ name: "eyebrow", label: "Eyebrow", type: "string" },
		{
			name: "title",
			label: "Title",
			type: "string",
			ui: { component: "textarea" },
		},
		{
			name: "mediaType",
			label: "Media Type",
			type: "string",
			options: ["image", "video"],
		},
		{ name: "mediaId", label: "R2 Media Identifier", type: "image" },
		{ name: "imageAlt", label: "Image Alt Text", type: "string" },
		{ name: "placeholderLabel", label: "Placeholder Label", type: "string" },
		{ name: "ctaText", label: "Link Text", type: "string" },
		{ name: "ctaLink", label: "Link URL", type: "string" },
		{
			name: "items",
			label: "Work Items",
			type: "object",
			list: true,
			ui: { itemProps: (item) => ({ label: item?.title }) },
			fields: [
				{ name: "title", label: "Title", type: "string" },
				{ name: "link", label: "URL", type: "string" },
				{ name: "mediaId", label: "R2 Media Identifier", type: "image" },
				{ name: "imageAlt", label: "Image Alt Text", type: "string" },
				{
					name: "placeholderLabel",
					label: "Placeholder Label",
					type: "string",
				},
			],
		},
	],
};

const editorialMissionBlock: TinaField = {
	name: "editorialMission",
	label: "Studio Mission",
	type: "object",
	fields: [
		{ name: "label", label: "Label", type: "string" },
		{ name: "content", label: "Content", type: "rich-text" },
		{
			name: "statement",
			label: "Closing Statement",
			type: "string",
			ui: { component: "textarea" },
		},
		{ name: "mediaId", label: "R2 Media Identifier", type: "image" },
		{ name: "imageAlt", label: "Image Alt Text", type: "string" },
		{ name: "placeholderLabel", label: "Placeholder Label", type: "string" },
	],
};

const editorialCarouselBlock: TinaField = {
	name: "editorialCarousel",
	label: "Carousel",
	type: "object",
	fields: [
		{
			type: "object",
			name: "items",
			label: "Carousel Items",
			list: true,
			fields: [
				{ type: "image", name: "mediaId", label: "R2 Media Identifier" },
				{ type: "string", name: "alt", label: "Alt Text" },
				{ type: "string", name: "caption", label: "Caption" },
			],
		},
	],
};

const editorialInstagramBlock: TinaField = {
	name: "editorialInstagram",
	label: "Instagram",
	type: "object",
	fields: [
		{ name: "title", label: "Title", type: "string" },
		{ name: "description", label: "Description", type: "rich-text" },
		{
			name: "tag",
			label: "Instagram Tag (Optional)",
			type: "string",
			description: "Enter a tag to filter posts by (e.g. novedades, latrobada)",
		},
		{
			name: "limit",
			label: "Total Limit",
			type: "number",
			description: "Maximum total number of posts to display",
		},
		{
			name: "maxVisible",
			label: "Max Visible Posts",
			type: "number",
			description:
				"Show up to this many posts at once (e.g. 4). If more are available, a horizontal carousel is created.",
		},
	],
};

const editorialGalleryBlock: TinaField = {
	name: "editorialGallery",
	label: "Gallery",
	type: "object",
	fields: galleryFields,
};
const projectBannerBlock: TinaField = {
	name: "projectBanner",
	label: "Project Banner",
	type: "object",
	fields: [
		{ type: "image", name: "mediaId", label: "R2 Media Identifier" },
		{ type: "string", name: "alt", label: "Alt Text" },
	],
};

const projectDetailsBlock: TinaField = {
	name: "projectDetails",
	label: "Project Details",
	type: "object",
	fields: [
		{ type: "string", name: "title", label: "Title" },
		{ type: "string", name: "subtitle", label: "Subtitle" },
		{ type: "image", name: "mediaId", label: "R2 Media Identifier" },
		{ type: "string", name: "services", label: "Services" },
		{ type: "string", name: "servicesLabel", label: "Services Label" },
		{ type: "string", name: "category", label: "Category" },
		{ type: "string", name: "categoryLabel", label: "Category Label" },
		{ type: "string", name: "area", label: "Area" },
		{ type: "string", name: "areaLabel", label: "Area Label" },
		{ type: "string", name: "location", label: "Location" },
		{ type: "string", name: "locationLabel", label: "Location Label" },
	],
};

const projectBriefBlock: TinaField = {
	name: "projectBrief",
	label: "Project Brief",
	type: "object",
	fields: [
		{ type: "string", name: "title", label: "Section Title" },
		{ type: "rich-text", name: "text", label: "Text" },
	],
};

const projectConceptBlock: TinaField = {
	name: "projectConcept",
	label: "Project Concept",
	type: "object",
	fields: [
		{ type: "string", name: "title", label: "Section Title" },
		{ type: "rich-text", name: "text", label: "Text" },
	],
};

const projectStrategyBlock: TinaField = {
	name: "projectStrategy",
	label: "Project Strategy",
	type: "object",
	fields: [
		{ type: "string", name: "title", label: "Section Title" },
		{ type: "rich-text", name: "text", label: "Text" },
	],
};

const projectCollaboratorsBlock: TinaField = {
	name: "projectCollaborators",
	label: "Project Collaborators",
	type: "object",
	fields: [
		{ type: "string", name: "title", label: "Section Title" },
		{
			type: "object",
			name: "list",
			label: "Collaborators",
			list: true,
			fields: [
				{ type: "string", name: "name", label: "Name" },
				{ type: "string", name: "role", label: "Role" },
			],
		},
	],
};

const projectFinalImageBlock: TinaField = {
	name: "projectFinalImage",
	label: "Project Final Image",
	type: "object",
	fields: imageFields,
};

const pageBlocksField: TinaField = {
	type: "object",
	name: "blocks",
	label: "Page Blocks",
	list: true,
	templates: [
		contactFormBlock,
		editorialBannerBlock,
		editorialHeroBlock,
		editorialCopyBlock,
		editorialAccordionBlock,
		editorialRowsBlock,
		editorialCtaBlock,
		editorialShowcaseBlock,
		editorialMissionBlock,
		editorialCarouselBlock,
		editorialInstagramBlock,
		editorialGalleryBlock,
	],
};

const projectBlocksField: TinaField = {
	type: "object",
	name: "blocks",
	label: "Project Blocks",
	list: true,
	templates: [
		projectBannerBlock,
		projectDetailsBlock,
		projectBriefBlock,
		projectConceptBlock,
		projectStrategyBlock,
		projectCollaboratorsBlock,
		projectFinalImageBlock,
		editorialGalleryBlock,
		editorialCarouselBlock,
		editorialInstagramBlock,
	],
};

const homePageFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Page Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Meta Description",
		ui: { component: "textarea" },
	},
	{
		type: "string" as const,
		name: "headerStyle",
		label: "Header Style",
		options: ["default", "transparent"],
	},
	pageBlocksField,
];

const aboutPageFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Page Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Meta Description",
		ui: { component: "textarea" },
	},
	pageBlocksField,
];

const servicesPageFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Page Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Meta Description",
		ui: { component: "textarea" },
	},
	pageBlocksField,
];

const contactPageFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Page Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Meta Description",
		ui: { component: "textarea" },
	},
	pageBlocksField,
];

const projectFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Description",
		ui: { component: "textarea" },
	},
	{ type: "string" as const, name: "slug", label: "URL Slug" },
	{
		type: "datetime" as const,
		name: "publishDate",
		label: "Publish Date",
		required: false,
	},
	{
		type: "datetime" as const,
		name: "completedDate",
		label: "Completed Date",
		required: false,
	},
	{ type: "string" as const, name: "tags", label: "Tags", list: true },
	{
		type: "boolean" as const,
		name: "showTags",
		label: "Show Tags on Projects List",
	},
	{ type: "boolean" as const, name: "featured", label: "Featured" },
	{ type: "boolean" as const, name: "draft", label: "Draft" },
	projectBlocksField,
];

// ============================================================================
// LEGAL PAGE FIELDS (MDX)
// ============================================================================

const legalPageFields: TinaField[] = [
	{
		type: "string" as const,
		name: "title",
		label: "Title",
		isTitle: true,
		required: true,
	},
	{
		type: "string" as const,
		name: "description",
		label: "Meta Description",
		ui: { component: "textarea" },
	},
	{ type: "datetime" as const, name: "lastUpdated", label: "Last Updated" },
	{ type: "rich-text" as const, name: "body", label: "Content", isBody: true },
];

// ============================================================================
// TRANSLATIONS FIELDS
// ============================================================================

const translationFields: TinaField[] = [
	{
		type: "object" as const,
		name: "nav",
		label: "Navigation",
		fields: [
			{ name: "social", label: "Social Label", type: "string" },
			{ name: "menu", label: "Menu Label", type: "string" },
			{ name: "letsTalk", label: "Let's Talk", type: "string" },
			{
				name: "links",
				label: "Navigation Links",
				type: "object",
				list: true,
				ui: {
					itemProps: (item) => ({ label: item?.label }),
				},
				fields: [
					{ name: "label", label: "Label", type: "string" },
					{
						name: "href",
						label: "URL Path (include lang prefix if needed, e.g. /es/studio)",
						type: "string",
					},
				],
			},
		],
	},
	{
		type: "object" as const,
		name: "footer",
		label: "Footer",
		fields: [
			{ name: "privacy", label: "Privacy Policy Link", type: "string" },
			{ name: "legal", label: "Legal Notice Link", type: "string" },
			{
				name: "links",
				label: "Navigation Links",
				type: "object",
				list: true,
				ui: {
					itemProps: (item) => ({ label: item?.label }),
				},
				fields: [
					{ name: "label", label: "Label", type: "string" },
					{
						name: "href",
						label: "URL Path (include lang prefix if needed, e.g. /es/studio)",
						type: "string",
					},
				],
			},
		],
	},
	{
		type: "object" as const,
		name: "contactForm",
		label: "Contact Form",
		fields: [
			{ name: "name", label: "Name Field", type: "string" },
			{ name: "company", label: "Company Field", type: "string" },
			{ name: "email", label: "Email Field", type: "string" },
			{ name: "phone", label: "Phone Field", type: "string" },
			{ name: "projectType", label: "Project Type Label", type: "string" },
			{
				type: "object" as const,
				name: "projectTypes",
				label: "Project Types",
				list: true,
				ui: { itemProps: (item) => ({ label: item?.label }) },
				fields: [
					{ name: "value", label: "Value (sent in email)", type: "string" },
					{ name: "label", label: "Label (shown in dropdown)", type: "string" },
				],
			},
			{ name: "serviceType", label: "Service Type Label", type: "string" },
			{
				type: "object" as const,
				name: "serviceTypes",
				label: "Service Types",
				list: true,
				ui: { itemProps: (item) => ({ label: item?.label }) },
				fields: [
					{ name: "value", label: "Value (sent in email)", type: "string" },
					{ name: "label", label: "Label (shown in dropdown)", type: "string" },
				],
			},
			{ name: "message", label: "Message Field", type: "string" },
			{ name: "privacy", label: "Privacy Checkbox", type: "string" },
			{ name: "submit", label: "Submit Button", type: "string" },
			{ name: "sending", label: "Sending Text", type: "string" },
			{ name: "success", label: "Success Message", type: "string" },
			{ name: "error", label: "Error Message", type: "string" },
			{
				name: "turnstileFailed",
				label: "Turnstile Failed Message",
				type: "string",
			},
			{ name: "invalidEmail", label: "Invalid Email Message", type: "string" },
			{
				name: "missingFields",
				label: "Missing Fields Message",
				type: "string",
			},
		],
	},
	{
		type: "object" as const,
		name: "projects",
		label: "Projects Page",
		fields: [
			{ name: "title", label: "Page Title", type: "string", required: true },
			{ name: "description", label: "Meta Description", type: "string" },
			{ name: "heading", label: "Heading", type: "string" },
		],
	},
	{
		type: "object" as const,
		name: "accessibility",
		label: "Accessibility",
		fields: [
			{ name: "skipToContent", label: "Skip to Content", type: "string" },
			{ name: "selectLanguage", label: "Select Language", type: "string" },
			{ name: "toggleMenu", label: "Toggle Menu", type: "string" },
			{ name: "closeMenu", label: "Close Menu", type: "string" },
			{ name: "previousSlide", label: "Previous Slide", type: "string" },
			{ name: "nextSlide", label: "Next Slide", type: "string" },
			{ name: "goToSlide", label: "Go to Slide", type: "string" },
		],
	},
];

// PROJECT FIELDS (Replaced with Blocks)

function localeFromDocument(document: {
	_sys: { breadcrumbs?: string[]; path?: string };
}) {
	return (
		document._sys.breadcrumbs?.[0] ||
		document._sys.path?.split("/").at(-2) ||
		"es"
	);
}

// ============================================================================
// TINA CONFIG
// ============================================================================

export default defineConfig({
	branch: process.env.TINA_BRANCH || process.env.CF_PAGES_BRANCH || "main",
	clientId: process.env.TINA_CLIENT_ID || "",
	token: process.env.TINA_TOKEN || "",

	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},

	media: {
		loadCustomStore: async () => {
			const { TinaCloudS3MediaStore } = await import("next-tinacms-s3");
			return TinaCloudS3MediaStore;
		},
	},

	schema: {
		collections: [
			// ========================================
			// SITE CONFIG (single file)
			// ========================================
			{
				name: "siteConfig",
				label: "Site Configuration",
				path: "src/content/config",
				format: "json",
				match: { include: "site" },
				fields: siteConfigFields,
				ui: {
					allowedActions: { create: false, delete: false },
					global: true,
				},
			},

			// ========================================
			// PAGE SINGLETONS (JSON)
			// ========================================
			{
				name: "home",
				label: "Pages / Home",
				path: "src/content/pages",
				format: "json",
				match: { include: "*/home" },
				fields: homePageFields,
				ui: {
					allowedActions: { create: false, delete: false },
					router: ({ document }) => `/${localeFromDocument(document)}/`,
				},
			},
			{
				name: "about",
				label: "Pages / Studio",
				path: "src/content/pages",
				format: "json",
				match: { include: "*/about" },
				fields: aboutPageFields,
				ui: {
					allowedActions: { create: false, delete: false },
					router: ({ document }) => `/${localeFromDocument(document)}/studio`,
				},
			},
			{
				name: "services",
				label: "Pages / Methods",
				path: "src/content/pages",
				format: "json",
				match: { include: "*/services" },
				fields: servicesPageFields,
				ui: {
					allowedActions: { create: false, delete: false },
					router: ({ document }) => `/${localeFromDocument(document)}/methods`,
				},
			},
			{
				name: "contact",
				label: "Pages / Contact",
				path: "src/content/pages",
				format: "json",
				match: { include: "*/contact" },
				fields: contactPageFields,
				ui: {
					allowedActions: { create: false, delete: false },
					router: ({ document }) => `/${localeFromDocument(document)}/contact`,
				},
			},

			// ========================================
			// LEGAL PAGES (MDX)
			// ========================================
			{
				name: "legal",
				label: "Legal / Pages",
				path: "src/content/legal",
				format: "mdx",
				fields: legalPageFields,
				ui: {
					router: ({ document }) =>
						`/${localeFromDocument(document)}/${document._sys.filename}`,
				},
			},

			// ========================================
			// PROJECTS (JSON - rigid layout)
			// ========================================
			{
				name: "projects",
				label: "Portfolio / Projects",
				path: "src/content/projects",
				format: "json",
				fields: projectFields,
				defaultItem: () => {
					return {
						title: "New Project",
						description: "",
						slug: "new-project",
						publishDate: new Date().toISOString(),
						tags: [],
						showTags: true,
						featured: false,
						draft: true,
						blocks: [
							{ _template: "projectBanner" },
							{ _template: "projectDetails", title: "New Project" },
							{ _template: "projectBrief", title: "BRIEF", text: "" },
							{ _template: "projectConcept", title: "CONCEPTO", text: "" },
							{ _template: "projectStrategy", title: "ESTRATEGIA", text: "" },
							{
								_template: "projectCollaborators",
								title: "COLABORADORES",
								list: [],
							},
							{ _template: "projectFinalImage" },
						],
					};
				},
				ui: {
					router: ({ document }) =>
						`/${localeFromDocument(document)}/works/${document._sys.filename}`,
					filename: {
						slugify: (values) =>
							values?.slug ||
							values?.title
								?.toLowerCase()
								.replace(/\s+/g, "-")
								.replace(/[^a-z0-9-]/g, "") ||
							"untitled",
					},
				},
			},

			// ========================================
			// TRANSLATIONS
			// ========================================
			{
				name: "translations",
				label: "System / Translations",
				path: "src/content/translations",
				format: "json",
				fields: translationFields,
				ui: {
					allowedActions: { create: false, delete: false },
					global: true,
				},
			},
		],
	},
});
