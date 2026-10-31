# Home PDF Vertical Alignment and Typography

## Goal

Match the deployed ES/CA/EN homepage to the PDF’s shared desktop grid and text scale without changing editorial content or behavior.

## Non-goals

- Do not edit `senshac-content`, translations, block order, questionnaire copy/routes/IDs/submission behavior, confirmed media IDs, or the HLS source.
- Do not replace the hero image or copy. The “Conócenos” CTA sits in a white strip immediately below the image with about half a text line of whitespace above and below; no arrow is requested.
- Do not infer or replace unconfirmed media.
- Do not change carousel/process scrolling, Instagram tag/link settings, or form behavior.
- No direct Cloudflare/R2 operations or DNS changes. The owner approved release to the documented production target (https://cutover.senshac.com) via the existing GitHub Actions workflow; use a reviewed PR merge to main to trigger it.
- Do not introduce dependencies or broaden the layout changes to non-home routes.

## Context and evidence

- Reference: `WEB HOME PAGE.pdf`, reviewed as raster pages at 800px wide, including p. 1, pp. 2–5, pp. 6–9, and pp. 10–11. The existing deployment screenshot is `/tmp/senshac-live-home-pdf-a95a1c6-es-top.jpg`.
- The repeated text/media boundary is about x=335/800 (41.9% of the viewport). The section shell is about x=48..752 (6% side gutters). Within that shell, the reference’s left media column, gap, and right copy column are approximately 34:7:59. At a 1200px viewport this puts the common rail near x=505.
- The rail is visible at the hero tagline/headline, differentiation headline, body copy, RUDE media, benefits intro/list, process copy/carousel, and inquiry content. The inquiry heading stays in the left column. The final featured-projects feed stays aligned to the shell’s left edge, not the rail. The opening project carousel is full-bleed and its second slide begins at the rail.
- PDF typography estimates from the same 800px previews: hero and editorial headings ~30px at 1200px; body ~18px; benefits labels ~22px; process numbers ~38px, step headings ~22px, step body ~18px; inquiry heading ~29px; feed title ~18px. These are starting values and require a local screenshot comparison.
- The live ES screenshot shows the hero copy much farther right and larger than the PDF. The current Home content is already published by senshac-content PR #66; the relevant content order and media must remain unchanged.
- The content worktree `/workspace/NacoSolutions/senshac-content/.git.fix-home-pdf-block-order` is clean at `004e5e4` (editorial content commit `82ffdd5`). The local `senshac-content/main` worktree is stale, so local builds must pin `SENSHAC_CONTENT_PATH`, `SENSHAC_CONTENT_REVISION`, and `TINA_LOCAL_CONTENT_PATH` to the feature worktree/revision.
- `scripts/sync-editorial-content.mjs` replaces generated `src/content/{config,pages,legal,projects,translations}`. Preflight that path before any build; its current status is clean and `src/content` has no local ignored payload.
- The active web branch is `fix/homepage-pdf-vertical-alignment`, based on `origin/main`. Repository Seeds had no ready issue; implementation Seed is `senshac-web-028f`. Mulch was primed; no matching prior layout record exists. Engram search tools are unavailable; the previous workspace plan `docs/plans/homepage-pdf-alignment.md` was reviewed.

## Blast radius

- `src/pages/[lang]/index.astro`: scope home layout styles to `.home-page`, tune desktop shell and text sizing.
- `src/components/sections/editorial/Hero.astro`: move the CTA below the image into a compact white strip, scoped to Home so other Hero instances do not change.
- `src/components/BlocksRenderer.astro`: expose the existing block template as a data attribute for page-scoped layout selectors.
- `e2e/homepage-sections.spec.ts`: replace obsolete carousel/Instagram expectations with the already-published 10-block content contract and geometry/type assertions for ES, CA, and EN.
- No content repository, Tina schema, generated lockfile, routes, media, form, or non-home section changes.

## Steps

1. **Red — add the browser contract.** Update `e2e/homepage-sections.spec.ts` for the current 10-block Home structure and assert at 1200px that the hero, text, showcase, accordion, process, and inquiry content share the shell-relative 41% rail; assert the inquiry heading and final feed remain on the shell’s left edge. Include computed font-size assertions for the reference hierarchy and a 390px no-overflow/mobile-flow check. Run the focused spec against the pinned content revision and confirm the rail/type assertions fail before implementation.
2. **Add page-scoped block metadata and grid.** In `BlocksRenderer.astro`, add `data-block-template={template}` to each existing Tina block wrapper. In `index.astro`, add `home-page` to the Home main element and a global style block scoped under it. At widths ≥768px, set the editorial shell to 88vw and use 34fr / 7% gap / 59fr columns. Put hero/copy/benefits/process/inquiry text on the right rail, keep the inquiry heading on the left, split the RUDE showcase 34:7:59, and make the opening two-slide carousel full-bleed at 42:58 with its seam at the rail. Keep the feed at the shell’s left edge. Leave mobile layout and all existing interactions intact.
3. **Revise the hero E2E contract before implementation.** Replace the stale overlay/CTA-at-image-edge assertion in `e2e/design-reference-layout.spec.ts`: media must end before a white CTA strip, CTA follows media, has roughly 0.5em vertical padding above/below, and is visible at 1440×900. Preserve localized “Conócenos”; do not add an arrow. Assert intro >=22px and bold, title >=36px. Confirm the new assertions fail before implementation.
4. **Implement the Home hero.** Preserve image/copy; place CTA outside the overlay in a full-width white strip with ~0.5em vertical padding. Scope via Home parent selector, leave non-Home unchanged; verify desktop/mobile screenshots.
5. **Tune reference type sizes.** In the same home-scoped styles, apply the PDF-estimated desktop sizes: hero and editorial headings 30px at 1200px; benefits labels about 22px; process number/heading/body about 38/22/18px; inquiry heading about 29px; feed heading about 18px. Keep existing body text near 18px. Re-render at 1200px and adjust only these values if the visual comparison shows a clear mismatch.
6. **Green and review.** Run the focused ES/CA/EN E2E contract, inspect desktop and mobile screenshots, then run the web unit/lint/type/build gates. Review the complete diff and confirm no content or generated lockfile changes. The owner approved production release to https://cutover.senshac.com; publish only through the reviewed PR and existing workflow, without DNS changes.

## Tests

- The focused E2E test also proves Home CTA placement in a white strip after media, half-line spacing and initial visibility; hero intro/title use the requested larger/bolder scale. Non-Home rendering stays unchanged.
- Existing content-order, carousel-route, disabled-feed-link, accordion, and process-scroll behavior must remain covered by the updated Home E2E test and existing suite.

## Verification

Run in the web worktree’s devenv with the content worktree pinned:

```sh
bun install --frozen-lockfile
SENSHAC_CONTENT_PATH=/workspace/NacoSolutions/senshac-content/.git.fix-home-pdf-block-order \
SENSHAC_CONTENT_REVISION=82ffdd517d930bda8780af2110e960ae80596c45 \
TINA_LOCAL_CONTENT_PATH=../../../senshac-content/.git.fix-home-pdf-block-order \
bun run test:e2e -- e2e/homepage-sections.spec.ts
bun run lint
bun run test
bun run typecheck
bun run build
git diff --check
seeds doctor
mulch validate
```

The E2E/build runner may need the existing local Chromium and workerd loader wrappers; they remain temporary and untracked. Do not use the aggregate `bun run quality` because it shells out to npm in this repository.

## Rollback

Revert only the Home page style/marker/test changes if the PDF comparison or regression gates fail. Restore `.seeds/issues.jsonl` to the open state (or close the Seed with a truthful reason) if the task is abandoned. Do not revert or rewrite the published content branch.

## Open questions and risks

- Typography values are visual estimates from rasterized PDF previews; the local 1200px screenshots are the acceptance comparison. Preserve the provided copy even if its uppercase styling differs from the PDF rendering.
- The public feed’s current posts are fetched at build time; a feed outage can affect feed screenshots. Do not change its data source as part of this layout work.
- No form is submitted, no direct R2/Cloudflare access is performed, and no deployment is attempted.

### For Executor

Read order: this plan; `src/pages/[lang]/index.astro`; `src/components/BlocksRenderer.astro`; `Hero.astro`, `Copy.astro`, `Showcase.astro`, `Accordion.astro`, `Rows.astro`, and `Instagram.astro`; `e2e/homepage-sections.spec.ts`; `scripts/sync-editorial-content.mjs`.

Assumed working state: clean implementation branch `fix/homepage-pdf-vertical-alignment` except for the claimed Seed record; content fixture is clean at `senshac-content/.git.fix-home-pdf-block-order@82ffdd5`; do not use the stale local `senshac-content/main` worktree.

Owned files: `.seeds/issues.jsonl`, this plan, `src/pages/[lang]/index.astro`, `src/components/BlocksRenderer.astro`, `src/components/sections/editorial/Hero.astro`, `e2e/homepage-sections.spec.ts`, and `e2e/design-reference-layout.spec.ts`.

Verification commands: pinned-content focused Playwright spec; `bun run lint`; `bun run test`; `bun run typecheck`; `bun run build`; `git diff --check`; `seeds doctor`; `mulch validate`.
