import { expect, test } from "@playwright/test";

test("home inquiry links retain CMS-managed destinations", async ({ page }) => {
	await page.goto("/es/");
	const links = page.locator('.home-page [data-block-template="list"] a[href*="/contact?"]');
	await expect(links).toHaveCount(4);
	await expect(links.nth(0)).toHaveAttribute("href", /situation=first-space/);
	await expect(links.nth(1)).toHaveAttribute("href", /situation=existing-space/);
	await expect(links.nth(2)).toHaveAttribute("href", /situation=growth/);
	await expect(links.nth(3)).toHaveAttribute("href", /service=other-challenge/);
});

test("home inquiry paths distinguish primary choices from the fallback", async ({ page }) => {
	await page.goto("/es/");
	const links = page.locator('.home-page [data-block-template="list"] a[href*="/contact?"]');
	await expect(links).toHaveCount(4);
	for (let index = 0; index < 3; index++) {
		await expect(links.nth(index).locator("span")).toHaveAttribute("aria-hidden", "true");
		await expect(links.nth(index)).toHaveCSS("text-decoration-line", "none");
	}
	await expect(links.nth(3)).toHaveCSS("text-decoration-line", "underline");
	const fallbackRules = await links.nth(3).evaluate((link) => {
		const article = link.closest("article")!;
		const style = getComputedStyle(article);
		const previous = article.previousElementSibling;
		return {
			previousBottom: previous ? getComputedStyle(previous).borderBottomWidth : "missing",
			top: style.borderTopWidth,
			bottom: style.borderBottomWidth,
		};
	});
	expect(fallbackRules).toEqual({ previousBottom: "0px", top: "0px", bottom: "0px" });
});

test("home hero CTA keeps its CMS destination and northeast arrow", async ({ page }) => {
	await page.goto("/es/");
	const cta = page.locator(".home-hero__cta");
	await expect(cta).toBeVisible();
	await expect(cta).toHaveAttribute("href", /\/es\//);
	await expect(cta.locator(".home-hero__cta-arrow")).toBeVisible();
});

test("homepage hero title exposes Tina metadata", async ({ page }) => {
	await page.goto("/es/");
	await expect(page.locator(".home-hero__title")).toHaveAttribute(
		"data-tina-field",
		/---home\.blocks\.\d+\.title$/,
	);
});

test("legacy and incompatible inquiry URLs fail visibly instead of falling back", async ({
	page,
}) => {
	await page.goto("/es/contact?path=first-space&package=integral");
	await expect(page.getByRole("alert")).toContainText(
		"Selecciona una situación y un servicio compatibles.",
	);
	await page.goto(
		"/es/contact?situation=growth&service=strategic-consultation",
	);
	await expect(page.getByRole("alert")).toContainText(
		"Selecciona una situación y un servicio compatibles.",
	);
	await expect(page.locator("#contact-form")).toHaveCount(0);
	await page.goto(
		"/es/contact?situation=existing-space&service=integral&service=decorative-restyling",
	);
	await expect(page.getByRole("alert")).toContainText(
		"Selecciona una situación y un servicio compatibles.",
	);
});

test("the two inquiry selectors prefill, filter services, and adapt the questionnaire", async ({
	page,
}) => {
	await page.goto(
		"/es/contact?situation=existing-space&service=decorative-restyling",
	);
	const situation = page.getByLabel("¿Cuál es la situación de tu negocio?");
	const service = page.getByLabel("¿Qué alcance de servicio necesitas?");
	await expect(page.locator("#inquiry-selection select")).toHaveCount(2);
	await expect(situation).toHaveValue("existing-space");
	await expect(service).toHaveValue("decorative-restyling");
	await expect(page.locator("#contact-form")).toBeVisible();
	await expect(
		page.getByLabel(/¿Quieres darnos algún detalle más sobre tu caso/),
	).toBeEnabled();
	await expect(page.getByLabel("Alcance que buscas")).toHaveCount(0);
	await expect(page.locator('#contact-form input[type="file"]')).toHaveAttribute(
		"accept",
		/\.pdf/,
	);

	await service.selectOption("strategic-consultation");
	await expect(page.locator("#contact-form")).toBeHidden();
	await situation.selectOption("growth");
	await expect(service).toHaveValue("");
	await expect(page.locator("#selection-change-feedback")).toBeVisible();
	await expect(
		service.locator('option[value="strategic-consultation"]'),
	).toHaveJSProperty("disabled", true);

	await service.selectOption("decorative-restyling");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.getByLabel("¿Vas a abrir un nuevo espacio?")).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText("Quiero escalar mi negocio");

	await service.selectOption("other-challenge");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(
		page.getByLabel("¿En qué consiste tu proyecto o reto?"),
	).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText(
		"¿Tienes un reto diferente?",
	);

	await situation.selectOption("first-space");
	await service.selectOption("integral");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(
		page.getByLabel("¿Ya has elegido un local o estás buscando?"),
	).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText(
		"Quiero abrir mi primer espacio",
	);
});

test("service CTAs lock the preselected service across the dynamic questionnaire", async ({
	page,
}) => {
	await page.goto("/es/contact?service=decorative-restyling");
	const situation = page.getByLabel("¿Cuál es la situación de tu negocio?");
	const service = page.getByLabel("¿Qué alcance de servicio necesitas?");
	await expect(service).toHaveValue("decorative-restyling");
	await expect(service).toBeDisabled();
	await situation.selectOption("first-space");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page).toHaveURL(
		/situation=first-space&service=decorative-restyling&locked=service/,
	);
	await expect(service).toBeDisabled();
	await expect(page.locator("#contact-form")).toBeVisible();
});

test("homepage accordion toggles with keyboard activation", async ({
	page,
}) => {
	await page.goto("/es/");
	const summary = page.locator("details > summary").first();
	const details = summary.locator("..");
	await expect(summary).toBeVisible();
	await summary.focus();
	await summary.press("Enter");
	await expect(details).toHaveAttribute("open", "");
	await summary.press("Space");
	await expect(details).not.toHaveAttribute("open", "");
});
