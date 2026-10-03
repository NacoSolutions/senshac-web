import { expect, test } from "@playwright/test";

test("home inquiry links open the matching qualification path", async ({
	page,
}) => {
	await page.goto("/es/");
	await expect(
		page.getByRole("link", { name: /Quiero abrir mi primer espacio/ }),
	).toHaveAttribute("href", "/es/contact?situation=first-space");
	await expect(
		page.getByRole("link", { name: /Mi local no funciona como debería/ }),
	).toHaveAttribute("href", "/es/contact?situation=existing-space");
	await expect(
		page.getByRole("link", { name: /Quiero escalar mi negocio/ }),
	).toHaveAttribute("href", "/es/contact?situation=growth");
	await expect(
		page.getByRole("link", { name: /¿Tienes otro reto\?/ }),
	).toHaveAttribute(
		"href",
		"/es/contact?situation=growth&service=other-challenge",
	);
});

test("homepage banner exposes Tina metadata for the slogan line", async ({
	page,
}) => {
	await page.goto("/es/");
	await expect(page.getByText("interior", { exact: true })).toHaveAttribute(
		"data-tina-field",
		/---home\.blocks\.0\.topRight\.lines\.0$/,
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
	const service = page.getByLabel("¿Qué servicio necesitas?");
	await expect(page.locator("#inquiry-selection select")).toHaveCount(2);
	await expect(situation).toHaveValue("existing-space");
	await expect(service).toHaveValue("decorative-restyling");
	await expect(page.locator("#contact-form")).toBeVisible();
	await expect(page.getByLabel(/¿Qué no está funcionando/)).toBeEnabled();
	await expect(page.getByLabel("Alcance que buscas")).toHaveCount(0);
	await expect(page.locator('#contact-form input[type="file"]')).toHaveAttribute(
		"accept",
		/\.pdf/,
	);

	await service.selectOption("strategic-consultation");
	await situation.selectOption("growth");
	await expect(service).toHaveValue("");
	await expect(page.locator("#selection-change-feedback")).toBeVisible();
	await expect(
		service.locator('option[value="strategic-consultation"]'),
	).toHaveJSProperty("disabled", true);

	await service.selectOption("decorative-restyling");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.getByLabel("¿Qué tienes previsto?")).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText("Preparar el crecimiento");

	await service.selectOption("other-challenge");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.getByLabel("¿Qué situación o reto quieres resolver?")).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText("Tengo otra situación");

	await situation.selectOption("first-space");
	await service.selectOption("integral");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.getByLabel("Situación del local")).toBeEnabled();
	await expect(page.locator("#contact-form")).toContainText("Abrir un nuevo espacio");
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
