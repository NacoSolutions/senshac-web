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
		expect(await content.first().innerText(), `${path} has no rendered content`).not.toBe("");
	}
}

test.describe("Senshac browser smoke contract", () => {
	test("loads localized content and representative editorial pages", async ({ page }) => {
		for (const language of languages) {
			await expectPage(page, `/${language}/`);
			expect(await page.locator("html").getAttribute("lang")).toBe(language);
			expect(await page.locator("main#main").innerText()).not.toBe("");
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
});
