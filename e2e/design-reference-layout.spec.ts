import { expect, test } from "@playwright/test";

test("home hero overlays its title on full-width media at desktop and mobile", async ({
	page,
}) => {
	for (const viewport of [
		{ width: 1440, height: 900 },
		{ width: 390, height: 844 },
	]) {
		await page.setViewportSize(viewport);
		await page.goto("/es/");
		const hero = page.locator(".home-hero");
		const media = page.locator(".home-hero__media");
		const title = page.locator(".home-hero__title");
		await expect(hero).toBeVisible();
		const heroBox = await hero.boundingBox();
		const mediaBox = await media.boundingBox();
		const titleBox = await title.boundingBox();
		if (!heroBox || !mediaBox || !titleBox) {
			throw new Error("Home hero, media, and title need measurable bounds");
		}
		expect(heroBox.x).toBeLessThan(1);
		expect(heroBox.width).toBeGreaterThanOrEqual(viewport.width - 20);
		expect(Math.abs(mediaBox.x - heroBox.x)).toBeLessThan(1);
		expect(Math.abs(mediaBox.width - heroBox.width)).toBeLessThan(2);
		expect(titleBox.y).toBeGreaterThanOrEqual(mediaBox.y);
		expect(titleBox.y + titleBox.height).toBeLessThan(
			mediaBox.y + mediaBox.height,
		);
	}
});

test("Home hero typography and CTA white-strip placement follow feedback", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es/");
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".home-hero");
    const image = document.querySelector(".home-hero__media");
    const title = document.querySelector(".home-hero__title");
    const intro = document.querySelector(".home-hero__intro");
    const cta = document.querySelector(".home-hero__cta");
    if (!hero || !image || !title || !intro || !cta) return null;
    const box = (el: Element) => el.getBoundingClientRect();
    const style = getComputedStyle(cta);
    return {
      hero: box(hero), image: box(image), title: box(title), intro: box(intro), cta: box(cta),
      ctaDisplay: style.display,
      ctaMarginTop: parseFloat(style.marginTop),
      ctaArrowDisplay: getComputedStyle(cta, "::after").display,
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      introSize: parseFloat(getComputedStyle(intro).fontSize),
      introWeight: getComputedStyle(intro).fontWeight,
      background: style.backgroundColor,
      paddingTop: parseFloat(style.paddingTop),
      paddingBottom: parseFloat(style.paddingBottom),
      label: cta.textContent?.trim(),
    };
  });
  expect(metrics).not.toBeNull();
  if (!metrics) throw new Error("Hero geometry unavailable");
  expect(metrics.titleSize).toBeGreaterThanOrEqual(36);
  expect(metrics.introSize).toBeGreaterThanOrEqual(22);
  expect(Number(metrics.introWeight)).toBeGreaterThanOrEqual(600);
  expect(metrics.background).toBe("rgb(255, 255, 255)");
  expect(metrics.label).toContain("Conócenos");
  expect(metrics.ctaDisplay).toBe("flex");
  expect(metrics.ctaMarginTop).toBe(0);
  expect(metrics.ctaArrowDisplay).toBe("none");
  expect(metrics.cta.top).toBeGreaterThanOrEqual(metrics.image.bottom);
  expect(metrics.cta.top - metrics.image.bottom).toBeLessThanOrEqual(1);
  expect(metrics.paddingTop).toBeGreaterThanOrEqual(8);
  expect(metrics.paddingTop).toBeLessThanOrEqual(14);
  expect(metrics.paddingBottom).toBeGreaterThanOrEqual(8);
  expect(metrics.paddingBottom).toBeLessThanOrEqual(14);
  expect(metrics.cta.bottom).toBeLessThanOrEqual(900);
});
test("home header uses light text over the dark full-bleed hero", async ({
	page,
}) => {
	await page.goto("/es/");
	const header = page.locator("header[data-chrome-scrolling]");
	await expect(header).toHaveAttribute(
		"data-chrome-scrolling",
		"transparent-light",
	);
	await expect(header).toHaveAttribute("data-chrome-at-final", "opaque-light");
	await expect(header).toHaveClass(/text-white/);
});

test("Studio founder heading uses prominent page-title typography", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/es/studio");
	const heading = page.getByRole("heading", {
		level: 1,
		name: "Ester, sin hache",
	});
	await expect(heading).toBeVisible();
	const fontSize = await heading.evaluate((element) =>
		Number.parseFloat(getComputedStyle(element).fontSize),
	);
	expect(fontSize).toBeGreaterThanOrEqual(40);
});

test("questionnaire layout is responsive without changing form semantics", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/es/contact?situation=first-space&service=integral");
	await expect(page.locator("#contact-form")).toBeVisible();
	const content = page.locator(".contact-block__content");
	const contentBox = await content.boundingBox();
	if (!contentBox) {
		throw new Error("Contact content needs measurable bounds");
	}
	expect(contentBox.width).toBeGreaterThan(800);

	const contentColumns = await content.evaluate(
		(element) =>
			getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
	);
	expect(contentColumns).toBe(1);

	const name = page.locator('#contact-form input[name="name"]');
	await expect(name).toHaveAttribute("required", "");
	await expect(name).toHaveJSProperty("type", "text");
	const field = page.locator("#contact-form .contact-form__field").first();
	await expect(field).toHaveCSS("display", "grid");
	const desktopColumns = await field.evaluate(
		(element) =>
			getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
	);
	expect(desktopColumns).toBe(2);
	await expect(name).toHaveCSS("border-top-style", "solid");

	await name.focus();
	await page.keyboard.press("Tab");
	const company = page.locator('#contact-form input[name="company"]');
	await expect(company).toBeFocused();
	await expect(company).toHaveCSS("outline-width", "2px");

	await page.setViewportSize({ width: 390, height: 844 });
	await page.reload();
	const mobileColumns = await field.evaluate(
		(element) =>
			getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
	);
	expect(mobileColumns).toBe(1);
});
