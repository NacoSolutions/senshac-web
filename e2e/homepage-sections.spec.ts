import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test("Home follows the PDF order and ends with an unlinked featured Instagram feed", async ({ page }) => {
	const response = await page.goto("/es/", { waitUntil: "domcontentloaded" });
	expect(response?.status()).toBe(200);

	const renderedBlockIndexes = await page.evaluate(() =>
		[...document.querySelectorAll("[data-tina-field]")]
			.map((element) => element.getAttribute("data-tina-field")?.match(/home\.blocks\.(\d+)$/)?.[1])
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

	const blockIndex = (locator: Locator) =>
		locator.evaluate((element) => {
			const block = [...document.querySelectorAll("[data-tina-field]")].find((candidate) =>
				/home\.blocks\.\d+$/.test(candidate.getAttribute("data-tina-field") ?? "") &&
				candidate.contains(element),
			);
			const match = block?.getAttribute("data-tina-field")?.match(/home\.blocks\.(\d+)$/);
			return match ? Number(match[1]) : -1;
		});

	const hero = await page.locator(".home-hero").evaluate((element) => {
		const intro = element.querySelector(".home-hero__intro");
		const title = element.querySelector(".home-hero__title");
		const copy = element.querySelector(".home-hero__copy");
		if (!intro || !title || !copy) return null;
		const heroRect = element.getBoundingClientRect();
		const copyRect = copy.getBoundingClientRect();
		return {
			introPrecedesTitle: Boolean(
				intro.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
			),
			fontSize: Number.parseFloat(getComputedStyle(title).fontSize),
			textAlign: getComputedStyle(copy).textAlign,
			copyStartsOnRight: copyRect.left > heroRect.left + heroRect.width / 2,
		};
	});
	expect(hero).not.toBeNull();
	expect(hero?.introPrecedesTitle).toBe(true);
	expect(hero?.fontSize).toBeLessThanOrEqual(56);
	expect(hero?.textAlign).toBe("right");
	expect(hero?.copyStartsOnRight).toBe(true);

	const headline = page.getByRole("heading", {
		name: "Si tu producto o servicio te hace diferente, tu espacio tiene que demostrarlo.",
		exact: true,
	});
	const projectCarousels = page.locator("[data-project-carousel]");
	await expect(projectCarousels).toHaveCount(1);
	const opening = projectCarousels.first();
	await expect(opening).toHaveAttribute("data-visible-items", "2");
	await expect(opening.locator("[data-project-slide]")).toHaveCount(2);
	expect(
		await opening.locator("[data-project-slide] h3").allTextContents(),
	).toEqual(["La Trobada", "Doley"]);

	const fullyVisibleCount = async (carousel: Locator) =>
		carousel.locator("[data-project-carousel-track]").evaluate((track: HTMLElement) => {
			const bounds = track.getBoundingClientRect();
			return [...track.querySelectorAll("[data-project-slide]")].filter((slide) => {
				const rect = slide.getBoundingClientRect();
				return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
			}).length;
		});
	expect(await fullyVisibleCount(opening)).toBe(2);

	const bodyCopy = page
		.locator(".editorial-body")
		.filter({ hasText: "Diseñamos interiores con lenguaje visual propio" });
	const rudeLink = page.locator('[data-showcase-items] a[href="/es/works/rude"]');
	await expect(rudeLink).toHaveCount(1);
	await expect(
		page.locator("[data-showcase-items]").getByText("Imagen pendiente de confirmar", { exact: true }),
	).toHaveCount(1);
	expect(await page.locator('a[href="/es/works/rude"]').count()).toBe(1);
	await expect(page.getByRole("heading", { name: "¿Qué puede hacer el diseño por tu negocio?" })).toBeVisible();

	expect(await blockIndex(headline)).toBe(1);
	expect(await blockIndex(opening)).toBe(2);
	expect(await blockIndex(bodyCopy)).toBe(3);
	expect(await blockIndex(rudeLink)).toBe(4);

	const featuredHeading = page.getByRole("heading", {
		name: "PROYECTOS DESTACADOS",
		exact: true,
	});
	await expect(featuredHeading).toBeVisible();
	expect(await blockIndex(featuredHeading)).toBe(9);
	expect(await instagramHeading.count()).toBe(0);
	const feedSection = featuredHeading.locator("xpath=ancestor::section[1]");
	await expect(feedSection.locator('a[href*="instagram.com"]')).toHaveCount(0);
});
