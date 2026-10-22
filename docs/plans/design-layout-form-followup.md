# Design-reference layout and form follow-up

## Goal

Improve the remaining confirmed Home, Studio, and questionnaire presentation gaps against the supplied references without changing editorial data or questionnaire behavior.

## Non-goals

- Do not change form fields, labels, choices, required states, identifiers, names, query parameters, routes, HTTP methods/actions, validation, Turnstile, or submission handling.
- Do not change content JSON, service/project records, media IDs, or source-to-page mappings.
- Do not change Services/Works content differences that require owner-approved wording or missing assets.
- Do not change DNS or production configuration. Deploy only through the approved GitHub Actions workflow after explicit owner approval.

## Context

- Active work: Seed `senshac-web-91ec`. The original Seed excluded deployment; the owner later approved merge and deployment through the standard workflows.
- `src/components/sections/editorial/Hero.astro` is reached from the `hero` block in the localized Home pages. The current component puts the image above the copy; the reference places copy over a full-width image. Keep the current media ID because the intended hero source is still missing.
- The Home header is configured in senshac-content; the dark full-bleed hero requires `transparent-light`. Keep that cross-repository contract in the focused E2E test and merge/deploy the content setting first.
- `src/components/sections/editorial/Mission.astro` renders the localized Studio founder introduction. Its `label` is an H1 but styled as a small eyebrow; the reference gives it prominent title treatment. The correct founder portrait is still missing.
- `src/components/sections/contact/ContactBlock.astro` is the form-block renderer used on the localized Contact routes. It currently places contact information and the questionnaire in two desktop columns.
- `src/components/ContactForm.astro` implements the GET selection step and POST questionnaire, including dynamic service filtering and Turnstile. Existing `e2e/inquiry-and-expansion.spec.ts` covers route selection and field behavior.
- The prior visual QA found the Works grid already responsive and the remaining Services/Works differences depend on content or unconfirmed images; those are not layout-only edits.

## Blast radius

- Shared Astro presentation components affect Home, Studio, and Contact in ES/CA/EN.
- Add a focused Playwright layout contract; retain existing inquiry-flow coverage.
- No schema, content export, route, API, or deployment workflow changes.

## Steps

1. Update `src/components/sections/editorial/Hero.astro` to present the existing image as a full-bleed hero with the current title, intro, and CTA overlaid. Preserve Tina markers, alt text, eager loading, media ID, and heading semantics.
   - Test desktop and mobile title/image overlap in a focused Playwright test.
2. Update `src/components/sections/editorial/Mission.astro` to give the existing Studio introduction heading page-title scale while preserving the portrait, body copy, mission statement, and order.
   - Test the rendered heading and its prominent typography.
3. Reflow `src/components/sections/contact/ContactBlock.astro` so the existing contact details and questionnaire use a single wide content column. Keep the decorative banner and all text.
   - Test that the selected questionnaire remains visible in the wider layout.
4. Add scoped presentation classes/styles in `src/components/ContactForm.astro` for label/control rows and outlined controls on desktop, stacked labels on narrow screens, and visible keyboard focus. Preserve all form semantics and scripts.
   - Extend the focused Playwright test to check responsive presentation and retain the existing inquiry E2E flow as the behavior contract.
5. Run focused tests, the repository quality gate where the local Cloudflare runtime permits, and review the diff for unchanged field names/actions and content data.

## Verification

- `bun test test/legacy-parity.test.mjs`
- `bun run test:e2e -- e2e/design-reference-layout.spec.ts e2e/inquiry-and-expansion.spec.ts`
- `bun run quality` (report any environment-blocked step; do not repair unrelated failures)
- `git diff --check`

## Rollback

Revert only the Home, Studio, Contact presentation component edits and their focused test. Preserve the separate content worktree's uncommitted header-contrast fix and all existing reference/Seeds artifacts.

## Open questions

- Do not infer or substitute the missing Home hero or Studio portrait.
- The PDF's Contact field set differs from the live questionnaire. That difference is intentionally retained under the existing Seed's behavior/content constraint; change it only after explicit approval.

### For Executor

Read order: this plan; `docs/design-reference/analysis/cutover-comparison/post-implementation-qa.md` in the intake worktree; the four target Astro components; `e2e/inquiry-and-expansion.spec.ts`.

Assumed working state: branch `fix/design-layout-form-parity` is based on current `origin/main`; the separate content branch `fix/design-page-chrome-contrast` remains uncommitted and untouched.

Owned files: `src/components/sections/editorial/Hero.astro`, `src/components/sections/editorial/Mission.astro`, `src/components/sections/contact/ContactBlock.astro`, `src/components/ContactForm.astro`, and the focused E2E test.

Verification commands: the commands under “Verification,” run inside the repository's `direnv` environment with the sibling content checkout available.
