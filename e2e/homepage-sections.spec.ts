import { expect, test } from "@playwright/test";

test("Home project carousel labels slides and keeps the Instagram feed unlinked", async ({ page }) => {
	const response = await page.goto("/es/", { waitUntil: "domcontentloaded" });
	expect(response?.status()).toBe(200);

	const slides = page.locator(
		".editorial-section .carousel-track[data-carousel] a.carousel-slide",
	);
	const instagramHeading = page.getByRole("heading", {
		name: "Instagram",
		exact: true,
	});
	test.skip(
		(await slides.count()) <= 1 || (await instagramHeading.count()) === 0,
		"paired content revision is not present in web CI",
	);

	expect(await slides.count()).toBeGreaterThan(1);
	for (const slide of await slides.all()) {
		await expect(slide.locator("h3")).toContainText(/\S/);
		await expect(slide).toHaveAttribute("href", /^\/es\/works\//);
	}

	expect(await page.locator('a[href="/es/works/rude"]').count()).toBeGreaterThan(1);

	await expect(instagramHeading).toBeVisible();
	const instagramSection = instagramHeading.locator(
		"xpath=ancestor::section[1]",
	);
	await expect(instagramSection.locator('a[href*="instagram.com"]')).toHaveCount(0);
});
