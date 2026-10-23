import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

test("Home follows the project, accordion, featured-work, and Instagram layout", async ({ page }) => {
	const response = await page.goto("/es/", { waitUntil: "domcontentloaded" });
	expect(response?.status()).toBe(200);

	const projectCarousels = page.locator("[data-project-carousel]");
	const featuredHeading = page.getByRole("heading", {
		name: "PROYECTOS DESTACADOS",
		exact: true,
	});
	const instagramHeading = page.getByRole("heading", {
		name: "Instagram",
		exact: true,
	});
	test.skip(
		(await projectCarousels.count()) < 2 || (await instagramHeading.count()) === 0,
		"paired content revision is not present in web CI",
	);

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

	const opening = projectCarousels.nth(0);
	const featured = projectCarousels.nth(1);
	await expect(opening).toHaveAttribute("data-visible-items", "2");
	await expect(opening.locator("[data-project-slide]")).toHaveCount(2);
	expect(
		await opening.locator("[data-project-slide] h3").allTextContents(),
	).toEqual(["La Trobada", "Doley"]);
	await expect(featured).toHaveAttribute("data-visible-items", "3");
	await expect(featured.locator("[data-project-slide]")).toHaveCount(3);
	await expect(featuredHeading).toBeVisible();

	const fullyVisibleCount = async (carousel: Locator) =>
		carousel.locator("[data-project-carousel-track]").evaluate((track: HTMLElement) => {
			const bounds = track.getBoundingClientRect();
			return [...track.querySelectorAll("[data-project-slide]")].filter((slide) => {
				const rect = slide.getBoundingClientRect();
				return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
			}).length;
		});
	expect(await fullyVisibleCount(opening)).toBe(2);
	expect(await fullyVisibleCount(featured)).toBe(3);

	expect(
		await featured.locator("[data-project-slide] h3").allTextContents(),
	).toEqual(["La Trobada", "Doley", "Rude"]);
	await expect(
		page.locator('[data-showcase-items] a[href="/es/works/rude"]'),
	).toHaveCount(1);
	await expect(
		page.locator("[data-showcase-items]").getByText("Imagen pendiente de confirmar", { exact: true }),
	).toHaveCount(1);
	expect(await page.locator('a[href="/es/works/rude"]').count()).toBeGreaterThanOrEqual(2);

	const adjacentToInstagram = await page.evaluate(() => {
		const findBlock = (text: string) => {
			const heading = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].find(
				(element) => element.textContent?.trim() === text,
			);
			return heading?.closest("div[data-tina-field]");
		};
		return findBlock("PROYECTOS DESTACADOS")?.nextElementSibling === findBlock("Instagram");
	});
	expect(adjacentToInstagram).toBe(true);
	const instagramSection = instagramHeading.locator("xpath=ancestor::section[1]");
	await expect(instagramSection.locator('a[href*="instagram.com"]')).toHaveCount(0);
});
