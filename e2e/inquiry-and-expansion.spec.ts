import { expect, test } from "@playwright/test";

test("home inquiry links open the matching qualification path", async ({
	page,
}) => {
	await page.goto("/es/");
	await expect(
		page.getByRole("link", { name: /Quiero abrir mi primer espacio/ }),
	).toHaveAttribute("href", "/es/contact?path=first-space");
	await expect(
		page.getByRole("link", { name: /Mi local no funciona como debería/ }),
	).toHaveAttribute("href", "/es/contact?path=existing-space");
	await expect(
		page.getByRole("link", { name: /Quiero escalar mi negocio/ }),
	).toHaveAttribute("href", "/es/contact?path=growth");
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

test("contact form switches enabled fields for all three inquiry paths", async ({
	page,
}) => {
	await page.goto("/es/contact?path=existing-space");
	const selector = page.getByLabel("¿Qué necesitas resolver?");
	await expect(selector).toHaveValue("existing-space");
	await expect(
		page.locator('[data-inquiry-path="existing-space"]'),
	).toBeVisible();
	await expect(page.getByLabel(/¿Qué no está funcionando/)).toBeEnabled();
	await expect(
		page.locator('[data-inquiry-path="first-space"]'),
	).toHaveJSProperty("disabled", true);
	await expect(
		page.locator('[data-inquiry-path="existing-space"] input[type="file"]'),
	).toHaveAttribute("accept", /\.pdf/);

	await selector.selectOption("growth");
	await expect(page.locator('[data-inquiry-path="growth"]')).toBeVisible();
	await expect(page.getByLabel("¿Qué tienes previsto?")).toBeEnabled();
	await expect(
		page.locator('[data-inquiry-path="existing-space"]'),
	).toHaveJSProperty("disabled", true);

	await selector.selectOption("first-space");
	await expect(page.getByLabel("Situación del local")).toBeEnabled();
	await expect(page.locator('[data-inquiry-path="first-space"]')).toBeVisible();
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
