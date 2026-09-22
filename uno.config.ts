// uno.config.ts

import presetWind4 from "@unocss/preset-wind4";
import transformerDirectives from "@unocss/transformer-directives";
import { defineConfig, presetIcons, presetTypography } from "unocss";

export default defineConfig({
	presets: [
		presetWind4(),
		presetIcons({
			scale: 1.2,
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle",
			},
		}),
		presetTypography(),
	],
	transformers: [transformerDirectives()],
	// Safelist icons that come from CMS/dynamic data
	safelist: [
		// Social icons (from site config)
		"i-simple-icons-instagram",
		"i-simple-icons-linkedin",
		"i-simple-icons-pinterest",
		"i-simple-icons-twitter",
		"i-simple-icons-facebook",
		"i-simple-icons-youtube",
		"i-simple-icons-tiktok",
		"i-simple-icons-behance",
		"i-simple-icons-dribbble",
		"i-simple-icons-houzz",
		// UI icons used in components
		"i-lucide-arrow-up-right",
	],
	theme: {
		colors: {
			bg: {
				light: "#f2f2f2",
				dark: "#000",
			},
			text: {
				primary: "rgba(18, 18, 18, 0.85)",
				muted: "rgba(102, 102, 102, 0.85)",
				light: "#f1f1f1",
			},
			border: {
				DEFAULT: "#000",
				light: "rgba(255, 255, 255, 0.2)",
			},
		},
		fontFamily: {
			sans: "Sinteca, system-ui, sans-serif",
			jozsika: "Jozsika, serif",
		},
		fontSize: {
			// Match WordPress theme sizes but made fluid responsive with clamp()
			// UnoCSS fontSize uses [size, lineHeight] tuple format
			xs: ["0.875rem", "normal"], // 14px
			sm: ["clamp(0.875rem, 1vw + 0.5rem, 1rem)", "normal"], // 14-16px
			base: ["clamp(1.125rem, 1.5vw + 0.5rem, 1.25rem)", "normal"], // 18-20px - body default
			lg: ["clamp(1.25rem, 2vw + 0.5rem, 1.5rem)", "normal"], // 20-24px
			xl: ["clamp(1.5rem, 3vw + 0.5rem, 2rem)", "1"], // 24-32px
			"2xl": ["clamp(1.75rem, 3vw + 1rem, 2.25rem)", "1"], // 28-36px - sinteca-small-title
			"3xl": ["clamp(2rem, 4vw + 1rem, 3.25rem)", "1"], // 32-52px - sinteca-medium-title
			"4xl": ["clamp(2.5rem, 5vw + 1rem, 5rem)", "1"], // 40-80px - sinteca-big-title
			"5xl": ["clamp(3rem, 6vw + 1rem, 6rem)", "1.1"], // 48-96px - banner title
		},
	},
	shortcuts: {
		// Structural
		"container-content": "max-w-[1440px] mx-auto px-[15px]",
		"editorial-shell": "w-[min(100%-3rem,1440px)] mx-auto",
		"editorial-section": "py-[clamp(4rem,8vw,8rem)]",

		// Backgrounds
		"bg-section-light": "bg-bg-light",
		"bg-section-dark": "bg-bg-dark text-text-light",

		// Typography
		"sinteca-big-title": "font-sans font-medium text-4xl mb-0",
		"sinteca-medium-title": "font-sans font-medium text-3xl uppercase",
		"sinteca-small-title": "font-sans font-medium text-2xl uppercase",
		"sinteca-small-text": "font-sans font-normal text-xs",
		"jozsika-font": "font-jozsika",

		// Links
		"page-link": "font-jozsika text-[1.125rem] underline underline-offset-4",
		"page-link-icon": "inline-block w-4 h-4 ml-2 align-middle",

		// Editorial Typography
		"editorial-display":
			"max-w-[13ch] m-0 font-sans text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.94] uppercase whitespace-pre-line",
		"editorial-heading":
			"m-0 mb-[clamp(2rem,5vw,4rem)] font-sans text-[clamp(1.75rem,3.5vw,3.5rem)] font-bold leading-[1.2] normal-case whitespace-pre-line",
		"editorial-heading--compact":
			"editorial-heading text-[clamp(1.8rem,3vw,3.25rem)]",
		"editorial-heading--page":
			"editorial-heading text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.2]",
		"editorial-eyebrow":
			"m-0 mb-8 font-sans text-[0.8rem] font-semibold uppercase",
		"editorial-lede":
			"m-0 font-sans text-[clamp(1.2rem,2vw,1.75rem)] leading-[1.45] whitespace-pre-line max-w-[31rem]",
		"editorial-body":
			"m-0 font-sans text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.45] whitespace-pre-line",

		// Link
		"editorial-link":
			"inline-flex w-max items-center gap-[0.25em] mt-8 border-b border-current pb-[0.1em] text-[0.95rem] uppercase decoration-none transition-opacity duration-200 hover:opacity-70 after:content-empty after:inline-block after:w-[1.1em] after:h-[1.1em] after:bg-current after:[mask:url(\"data:image/svg+xml;utf8,<svg_xmlns='http://www.w3.org/2000/svg'_width='24'_height='24'_viewBox='0_0_24_24'_fill='none'_stroke='currentColor'_stroke-width='1.5'_stroke-linecap='round'_stroke-linejoin='round'><path_d='M7_17L17_7'/><path_d='M7_7h10v10'/></svg>\")_no-repeat_center/contain] after:[-webkit-mask:url(\"data:image/svg+xml;utf8,<svg_xmlns='http://www.w3.org/2000/svg'_width='24'_height='24'_viewBox='0_0_24_24'_fill='none'_stroke='currentColor'_stroke-width='1.5'_stroke-linecap='round'_stroke-linejoin='round'><path_d='M7_17L17_7'/><path_d='M7_7h10v10'/></svg>\")_no-repeat_center/contain]",

		// Common patterns
		"flex-center": "flex items-center justify-center",
		"flex-between": "flex items-center justify-between",
	},
	content: {
		pipeline: {
			include: [
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
				"src/**/*.{js,ts}",
				"tina/**/*.{ts,tsx}",
			],
		},
	},
});
