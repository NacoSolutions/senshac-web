import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

const locales = ["es", "ca", "en"] as const;
const expectedTemplates = [
	"hero",
	"text",
	"showcase",
	"text",
	"showcase",
	"accordion",
	"showcase",
	"list",
	"list",
	"feed",
];

const blockIndex = (locator: Locator) =>
	locator.evaluate((element) => {
		const block = [...document.querySelectorAll("#main > [data-tina-field]")].find(
			(candidate) => candidate.contains(element),
		);
		const match = block
			?.getAttribute("data-tina-field")
			?.match(/home\.blocks\.(\d+)$/);
		return match ? Number(match[1]) : -1;
	});

test("Home follows the PDF block order and preserves the opening and final feed", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1200, height: 865 });
	const response = await page.goto("/es/", { waitUntil: "domcontentloaded" });
	expect(response?.status()).toBe(200);

	const renderedBlockIndexes = await page.evaluate(() =>
		[...document.querySelectorAll("#main > [data-tina-field]")]
			.map((element) =>
				element.getAttribute("data-tina-field")?.match(/home\.blocks\.(\d+)$/)?.[1],
			)
			.filter((index) => index !== undefined),
	);
	const instagramHeading = page.getByRole("heading", {
		name: "Instagram",
		exact: true,
	});
	test.skip(
		renderedBlockIndexes.length === 11 && (await instagramHeading.count()) > 0,
		"paired homepage content revision is not present in web CI",
	);
	expect(renderedBlockIndexes).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

	const templates = await page.locator("#main > [data-tina-field]").evaluateAll((blocks) =>
		blocks.map((block) => block.getAttribute("data-block-template")),
	);
	expect(templates).toEqual(expectedTemplates);

	const block = (index: number) => page.locator("#main > [data-tina-field]").nth(index);
	const headline = block(1).getByRole("heading", {
		name: "Si tu producto o servicio te hace diferente, tu espacio tiene que demostrarlo.",
		exact: true,
	});
	const projectCarousel = block(2).locator("[data-project-carousel]");
	await expect(projectCarousel).toHaveCount(1);
	await expect(projectCarousel).toHaveAttribute("data-visible-items", "2");
	await expect(projectCarousel.locator("[data-project-slide]")).toHaveCount(2);
	expect(
		await projectCarousel.locator("[data-project-slide] h3").allTextContents(),
	).toEqual(["La Trobada", "Doley"]);
	const openingSlideStyle = await projectCarousel.locator("[data-project-slide]").first().evaluate((slide) => {
		const overlay = slide.querySelector(".showcase-project-carousel__overlay");
		if (!overlay) return null;
		return {
			overlayOffset: overlay.getBoundingClientRect().top - slide.getBoundingClientRect().top,
			borderWidth: getComputedStyle(slide).borderBottomWidth,
			borderColor: getComputedStyle(slide).borderBottomColor,
		};
	});
	expect(openingSlideStyle).not.toBeNull();
	expect(openingSlideStyle?.overlayOffset).toBeLessThanOrEqual(1);
	expect(openingSlideStyle?.borderWidth).toBe("1px");
	expect(openingSlideStyle?.borderColor).toBe("rgb(255, 255, 255)");
	await expect(block(7).locator(".editorial-phase-scroll__copy strong")).toContainText(
		"los pasos que tomaremos para empezar a trabajar en tu proyecto:",
	);
	await expect(block(7).locator(".editorial-phase-scroll__text em")).toHaveText("match");

	const rudeLink = block(4).locator('[data-showcase-items] a[href="/es/works/rude"]');
	await expect(rudeLink).toHaveCount(1);
	await expect(
		block(4).locator("[data-showcase-items]").getByText("Imagen pendiente de confirmar", { exact: true }),
	).toHaveCount(1);
	await expect(
		block(5).getByRole("heading", { name: "¿Qué puede hacer el diseño por tu negocio?" }),
	).toBeVisible();

	const featuredHeading = block(9).getByRole("heading", {
		name: "PROYECTOS DESTACADOS",
		exact: true,
	});
	if (await block(9).locator("section").count()) await expect(featuredHeading).toBeVisible();
	expect(await page.getByRole("heading", { name: "Instagram", exact: true }).count()).toBe(0);
	expect(await page.locator('a[href="/es/works/rude"]').count()).toBe(1);
	expect(await blockIndex(headline)).toBe(1);
	expect(await blockIndex(projectCarousel)).toBe(2);
	expect(await blockIndex(rudeLink)).toBe(4);
	if (await block(9).locator("section").count()) expect(await blockIndex(featuredHeading)).toBe(9);
	await expect(block(9).locator('a[href*="instagram.com"]')).toHaveCount(0);
});

for (const locale of locales) {
	test(`${locale.toUpperCase()} Home shares the PDF alignment rail and type scale`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1200, height: 865 });
		const response = await page.goto(`/${locale}/`, { waitUntil: "domcontentloaded" });
		expect(response?.status()).toBe(200);

		const accordion = page.locator("#main > [data-tina-field]").nth(5).locator("details").first();
		if (!(await accordion.getAttribute("open"))) {
			await accordion.locator("summary").click();
		}
		await expect(accordion).toHaveAttribute("open", "");

		const metrics = await page.evaluate(() => {
			type Box = {
				left: number;
				right: number;
				width: number;
				fontSize: number;
				textAlign: string;
			};
			const roots = [...document.querySelectorAll<HTMLElement>("#main > [data-tina-field]")];
			const block = (index: number) =>
				roots.find(
					(element) =>
						element.getAttribute("data-tina-field")?.match(/home\.blocks\.(\d+)$/)?.[1] ===
						String(index),
				) ?? null;
			const box = (element: Element | null | undefined): Box | null => {
				if (!element) return null;
				const rect = element.getBoundingClientRect();
				const style = getComputedStyle(element);
				return {
					left: rect.left,
					right: rect.right,
					width: rect.width,
					fontSize: Number.parseFloat(style.fontSize),
					textAlign: style.textAlign,
				};
			};
			const lineCount = (element: Element | null | undefined) => {
				if (!element) return null;
				const range = document.createRange();
				range.selectNodeContents(element);
				return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0).length;
			};
			const homeShell = block(0)?.querySelector(".editorial-shell");
			const shellRect = homeShell?.getBoundingClientRect();
			if (!shellRect) return null;
			const rail = shellRect.left + shellRect.width * 0.41;
			const mediaCarousel = block(2)?.querySelector(".showcase-project-carousel");
			const slides = [...(block(2)?.querySelectorAll("[data-project-slide]") ?? [])];
			return {
				viewportWidth: document.documentElement.clientWidth,
				shell: {
					left: shellRect.left,
					right: shellRect.right,
					width: shellRect.width,
				},
				rail,
				alignment: {
					heroTitle: box(block(0)?.querySelector(".home-hero__title"))?.left ?? null,
					headline: box(block(1)?.querySelector(".editorial-heading"))?.left ?? null,
					bodyCopy: box(block(3)?.querySelector(".editorial-body"))?.left ?? null,
					rudeMedia: box(block(4)?.querySelector("[data-showcase-items] > :nth-child(2)"))?.left ?? null,
					benefitIntro: box(block(5)?.querySelector(".editorial-lede"))?.left ?? null,
					benefitRows: box(block(5)?.querySelector(".border-t"))?.left ?? null,
					benefitSummary: box(block(5)?.querySelector("details > div .editorial-body"))?.left ?? null,
					processCopy: box(block(7)?.querySelector(".editorial-phase-scroll__copy"))?.left ?? null,
					processCarousel: box(block(7)?.querySelector(".editorial-phase-scroll__carousel"))?.left ?? null,
					processImage: box(block(7)?.querySelector(".editorial-phase-scroll__image"))?.left ?? null,
					inquiryTitle: box(block(8)?.querySelector(".editorial-heading"))?.left ?? null,
					inquiryRows: box(block(8)?.querySelector(".border-t"))?.left ?? null,
					videoMedia: box(block(6)?.querySelector(".editorial-shell > [data-tina-field]"))?.left ?? null,
					feedSection: box(block(9)?.querySelector("section"))?.left ?? null,
					feedTitle: box(block(9)?.querySelector("h2"))?.left ?? null,
				},
				hero: {
					copy: box(block(0)?.querySelector(".home-hero__copy")),
					title: box(block(0)?.querySelector(".home-hero__title")),
					cta: box(block(0)?.querySelector(".home-hero__cta")),
				},
				lines: {
					heroTitle: lineCount(block(0)?.querySelector(".home-hero__title")),
					processHeading: lineCount(block(7)?.querySelector(".editorial-phase-scroll__copy h2")),
				},
				typography: {
					heroTitle: box(block(0)?.querySelector(".home-hero__title"))?.fontSize ?? null,
					processHeading: box(block(7)?.querySelector(".editorial-phase-scroll__copy h2"))?.fontSize ?? null,
					headline: box(block(1)?.querySelector(".editorial-heading"))?.fontSize ?? null,
					bodyCopy: box(block(3)?.querySelector(".editorial-body"))?.fontSize ?? null,
					benefitTitle: box(block(5)?.querySelector("details > summary > span:nth-child(2)"))?.fontSize ?? null,
					processNumber: box(block(7)?.querySelector(".editorial-phase-scroll__number"))?.fontSize ?? null,
					processTitle: box(block(7)?.querySelector(".editorial-phase-scroll__card h3"))?.fontSize ?? null,
					processBody: box(block(7)?.querySelector(".editorial-phase-scroll__text"))?.fontSize ?? null,
					inquiryTitle: box(block(8)?.querySelector(".editorial-heading"))?.fontSize ?? null,
					feedTitle: box(block(9)?.querySelector("h2"))?.fontSize ?? null,
				},
				openingCarousel: {
					left: box(mediaCarousel)?.left ?? null,
					width: box(mediaCarousel)?.width ?? null,
					slideLefts: slides.map((slide) => box(slide)?.left ?? null),
					slideWidths: slides.map((slide) => box(slide)?.width ?? null),
				},
			};
		});

		expect(metrics).not.toBeNull();
		if (!metrics) throw new Error("Home layout metrics could not be measured");

		for (const [name, left] of Object.entries(metrics.alignment)) {
			if ((name === "feedSection" || name === "feedTitle") && left === null) continue;
			expect(left, `${name} should have a measurable left edge`).not.toBeNull();
			if (left !== null) {
				if (name === "processImage" || name === "inquiryTitle" || name === "videoMedia" || name === "feedSection" || name === "feedTitle") {
					expect(Math.abs(left - metrics.shell.left), `${name} should align to the shell edge`).toBeLessThanOrEqual(3);
				} else {
					expect(Math.abs(left - metrics.rail), `${name} should align to the shared rail`).toBeLessThanOrEqual(3);
				}
			}
		}

		expect(metrics.lines.heroTitle).toBe(2);
		expect(metrics.lines.processHeading).toBe(2);
		expect(metrics.hero.copy?.textAlign).toBe("left");
		expect(metrics.hero.cta?.right).not.toBeNull();
		expect(Math.abs((metrics.hero.cta?.right ?? 0) - metrics.shell.right)).toBeLessThanOrEqual(3);

		const typeTargets = {
			heroTitle: 30,
			headline: 30,
			bodyCopy: 18,
			benefitTitle: 21.6,
			processNumber: 38.4,
			processHeading: 18,
			processTitle: 21.6,
			processBody: 18,
			inquiryTitle: 28.8,
			feedTitle: 18,
		};
		for (const [name, target] of Object.entries(typeTargets)) {
			const size = metrics.typography[name as keyof typeof metrics.typography];
			if (name === "feedTitle" && size === null) continue;
			expect(size, `${name} font size should be measurable`).not.toBeNull();
			if (size !== null) {
				expect(Math.abs(size - target), `${name} font size should match the PDF scale`).toBeLessThanOrEqual(1);
			}
		}

		expect(metrics.openingCarousel.slideLefts).toHaveLength(2);
		expect(metrics.openingCarousel.slideWidths).toHaveLength(2);
		expect(metrics.openingCarousel.slideLefts[1]).not.toBeNull();
		expect(Math.abs((metrics.openingCarousel.slideLefts[1] ?? 0) - metrics.rail)).toBeLessThanOrEqual(3);
		expect((metrics.openingCarousel.slideWidths[0] ?? 0) / metrics.viewportWidth).toBeCloseTo(0.42, 2);
		expect((metrics.openingCarousel.slideWidths[1] ?? 0) / metrics.viewportWidth).toBeCloseTo(0.58, 2);
	});
}

test("Home preserves a single-column mobile flow without horizontal overflow", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const response = await page.goto("/es/", { waitUntil: "domcontentloaded" });
	expect(response?.status()).toBe(200);

	const mobile = await page.evaluate(() => {
		const heroTitle = document.querySelector(".home-hero__title");
		const shell = document.querySelector("#main .home-hero__content");
		if (!heroTitle || !shell) return null;
		const titleRect = heroTitle.getBoundingClientRect();
		const shellRect = shell.getBoundingClientRect();
		return {
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
			titleLeft: titleRect.left,
			shellLeft: shellRect.left,
			fontSize: Number.parseFloat(getComputedStyle(heroTitle).fontSize),
		};
	});
	expect(mobile).not.toBeNull();
	if (!mobile) throw new Error("Mobile Home layout metrics could not be measured");
	expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth);
	expect(Math.abs(mobile.titleLeft - mobile.shellLeft)).toBeLessThanOrEqual(1);
	expect(mobile.fontSize).toBeGreaterThanOrEqual(36);
	expect(mobile.fontSize).toBeLessThanOrEqual(52);
});
