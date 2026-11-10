import { expect, test } from "@playwright/test";

test("Home carousel headers and RUDE feature follow the PDF image layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es/");

  const projectCarousel = page.locator(".home-page [data-project-carousel]").first();
  const slide = projectCarousel.locator("[data-project-slide]").first();
  const overlay = slide.locator(".showcase-project-carousel__overlay");
  await expect(overlay).toBeVisible();
  const header = await slide.evaluate((element) => {
    const overlay = element.querySelector(".showcase-project-carousel__overlay")!;
    const slide = element.getBoundingClientRect();
    const rule = overlay.getBoundingClientRect();
    const style = getComputedStyle(overlay);
    return { leftInset: rule.left - slide.left, rightInset: slide.right - rule.right, topInset: rule.top - slide.top, borderTop: style.borderTopWidth };
  });
  expect(header.leftInset).toBeGreaterThan(0);
  expect(header.rightInset).toBeGreaterThan(0);
  expect(header.topInset).toBeGreaterThan(0);
  expect(header.borderTop).toBe("1px");

  const rude = page.locator('.home-page [data-block-template="showcase"] [data-showcase-items].rude-feature');
  await expect(rude.locator(":scope > *")).toHaveCount(2);
  const leftImage = rude.locator(":scope > :first-child");
  const media = leftImage.locator(".rude-feature__media");
  const fill = await media.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const inner = element.firstElementChild?.getBoundingClientRect();
    return inner && { widthDelta: Math.abs(box.width - inner.width), heightDelta: Math.abs(box.height - inner.height) };
  });
  expect(fill).toBeTruthy();
  expect(fill!.widthDelta).toBeLessThanOrEqual(2);
  expect(fill!.heightDelta).toBeLessThanOrEqual(2);
  await expect(rude.locator(":scope > :nth-child(2) .rude-feature__overlay")).toBeVisible();
});

test("Home Instagram feed shows three and only adds controls when more are available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es/");
  const instagram = page.locator('.home-page [data-block-template="feed"] [data-instagram-carousel]');
  await expect(instagram).toBeVisible();
  await expect(instagram).toHaveAttribute("data-visible-items", "3");
  const available = Number(await instagram.getAttribute("data-available-items"));
  expect(available).toBeGreaterThanOrEqual(3);
  const controls = instagram.locator(".instagram-carousel__controls");
  if (available > 3) {
    await expect(controls).toBeVisible();
    await expect(controls.getByRole("button")).toHaveCount(2);
  } else {
    await expect(controls).toHaveCount(0);
  }
});
