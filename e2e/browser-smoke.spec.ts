import { expect, test, type Page } from "@playwright/test";

const languages = ["es", "ca", "en"];
const representativeRoutes = [
	{ path: "about", landmark: "main" },
	{ path: "services", landmark: "main" },
	{ path: "contact", landmark: "main" },
	// Legal MDX pages render their stable content landmark as an article, not main.
	{ path: "legal-notice", landmark: "article", requiresContent: true },
	{ path: "privacy-policy", landmark: "article", requiresContent: true },
];

async function expectPage(page: Page, path: string, landmark = "main", requiresContent = false) {
	const response = await page.goto(path, { waitUntil: "domcontentloaded" });
	expect(response, `${path} did not return a response`).not.toBeNull();
	expect(response?.status(), path).toBe(200);
	const content = page.locator(landmark);
	expect(await content.count(), `${path} has no ${landmark} content`).toBeGreaterThan(0);
	if (requiresContent) {
		await expect(content.first(), `${path} has no rendered content`).toContainText(/\S/);
	}
}

test.describe("Senshac browser smoke contract", () => {
	test("loads localized content and representative editorial pages", async ({ page }) => {
		for (const language of languages) {
			await expectPage(page, `/${language}/`);
			expect(await page.locator("html").getAttribute("lang")).toBe(language);
			await expect(page.locator("main#main")).toContainText(/\S/);
		}

		for (const route of representativeRoutes) {
			await expectPage(page, `/en/${route.path}`, route.landmark, route.requiresContent);
		}
	});

	test("renders Tina field markers for live editing and representative blocks", async ({ page }) => {
		await expectPage(page, "/es/");
		expect(await page.locator("[data-tina-field]").count()).toBeGreaterThan(0);
		expect(await page.locator("header").count()).toBeGreaterThan(0);
		expect(await page.locator("footer").count()).toBeGreaterThan(0);
	});

	test("editorial navigation and grids adapt to desktop and mobile", async ({ page }) => {
		const headerNav = page.locator("header nav > ul");
		const menuButton = page.locator('button[aria-controls="mobile-menu"]');
		const mobileMenu = page.locator("#mobile-menu");
		const footerGrid = page.locator("footer .grid").first();
		const worksGrid = page.locator(".works-index__list");

		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/es/works/");
		await expect(headerNav).toBeVisible();
		await expect(headerNav.getByRole("link", { name: "Conócenos" })).toBeVisible();
		await expect(menuButton).toBeHidden();
		await expect
			.poll(() =>
				footerGrid.evaluate((element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(4);
		await expect
			.poll(() =>
				worksGrid.evaluate((element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(2);

		await page.setViewportSize({ width: 390, height: 844 });
		await expect(headerNav).toBeHidden();
		await expect(menuButton).toBeVisible();
		await expect
			.poll(() =>
				footerGrid.evaluate((element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(1);
		await expect
			.poll(() =>
				worksGrid.evaluate((element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(1);

		await menuButton.click();
		await expect(menuButton).toHaveAttribute("aria-expanded", "true");
		await expect(mobileMenu).toBeVisible();
		await expect(mobileMenu.getByRole("link", { name: "Proyectos" })).toBeVisible();
	});

	test("keeps the Tina admin entry point available", async ({ page }) => {
		const redirect = await page.request.get("/admin", { maxRedirects: 0 });
		expect(redirect.status()).toBe(302);
		expect(new URL(redirect.headers().location ?? "", "http://127.0.0.1").pathname).toBe(
			"/admin/index.html",
		);

		const admin = await page.goto("/admin/index.html", { waitUntil: "domcontentloaded" });
		expect(admin?.status()).toBe(200);
		expect(await page.locator("body").innerText()).not.toContain("404");
	});

	test("exposes the authenticated Tina island boundary", async ({ page }) => {
		const island = await page.request.get("/tina-island/header");
		expect(island.status()).toBe(405);

		const preview = await page.request.post("/tina-island/header", {
			headers: { "content-type": "application/json" },
		});
		expect(preview.status()).toBe(404);
	});
	test("Home phase cards scroll on desktop and remain touch-scrollable on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await expectPage(page, "/es/");
		const phase = page.locator("[data-phase-scroll]");
		const track = phase.locator("[data-phase-track]");
		await expect(phase.locator("[data-phase-card]")).toHaveCount(5);
		await expect(track).toHaveAttribute("tabindex", "0");
		const desktopOverflow = await track.evaluate(
			(element) => element.scrollWidth - element.clientWidth,
		);
		expect(desktopOverflow).toBeGreaterThan(0);

		const next = phase.getByRole("button", { name: "Siguiente diapositiva" });
		await expect(next).toBeEnabled();
		await next.click();
		await expect
			.poll(() => track.evaluate((element) => element.scrollLeft))
			.toBeGreaterThan(0);
		const thirdCard = phase.locator("[data-phase-card]").nth(2);
		await expect
			.poll(() => thirdCard.evaluate((card) => {
				const rail = card.closest("[data-phase-track]");
				if (!rail) return false;
				const cardBounds = card.getBoundingClientRect();
				const railBounds = rail.getBoundingClientRect();
				return cardBounds.left >= railBounds.left - 1 && cardBounds.right <= railBounds.right + 1;
			}))
			.toBe(true);
		await expect(next).toBeEnabled();
		await next.click();
		const fifthCard = phase.locator("[data-phase-card]").nth(4);
		await expect
			.poll(() => fifthCard.evaluate((card) => {
				const rail = card.closest("[data-phase-track]");
				if (!rail) return false;
				const cardBounds = card.getBoundingClientRect();
				const railBounds = rail.getBoundingClientRect();
				return cardBounds.left >= railBounds.left - 1 && cardBounds.right <= railBounds.right + 1;
			}))
			.toBe(true);
		await expect(next).toBeDisabled();

		await page.setViewportSize({ width: 390, height: 844 });
		await page.reload();
		const mobileOverflow = await track.evaluate(
			(element) => element.scrollWidth - element.clientWidth,
		);
		expect(mobileOverflow).toBeGreaterThan(0);
	});

});
