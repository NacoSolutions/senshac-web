# Homepage PDF typography, carousel, and navigation refinement

## Goal

Match the PDF’s homepage typography, inline emphasis, opening project-carousel treatment, and simplified header across ES/CA/EN without changing wording, routes, confirmed media, or page behavior.

## Scope

- **Web** (`senshac-web`): keep the Home-only hero and process typography changes page-scoped; render the existing localized hero wording in sentence case with the PDF’s two-line break; target the PDF’s two-line hero and process heading at 1200px; move the opening two-project carousel labels to the image tops and add a thin white bottom rule. Replace the mobile menu drawer with the same four localized navigation links shown inline at every breakpoint, retaining the language selector. The current link order is already correct: Services, Projects, About, Contact.
- **Content** (`senshac-content`): encode the PDF’s bold process-intro clause and italic “match” as Tina rich-text marks in ES/CA/EN, using the existing localized wording and equivalent phrases in CA/EN.
- **Tests**: cover localized emphasis, headline line counts/type sizes, opening-carousel treatment, and the visible four-link navigation on desktop and mobile.

## Guardrails

- Preserve the existing wording, block order, routes, form behavior, confirmed media IDs, HLS URL, questionnaire, Instagram tag/link settings, and all non-homepage editorial styling.
- Do not infer or replace unconfirmed images. Do not change DNS, Cloudflare/R2, or production. Do not merge or deploy without explicit approval.
- Keep the header change limited to removing the menu drawer and keeping its four links accessible inline; retain the existing language-dropdown behavior.

## Work sequence

1. Add failing content, unit, and browser assertions for rich-text emphasis, the desktop PDF type/line targets, carousel labels/rule, and mobile navigation.
2. Update the localized hero title casing/line breaks and phase-scroll rich-text content; extend the content contract test.
3. Adjust Home-scoped CSS for hero sentence-case sizing/line wrapping, the process heading, and the opening carousel. Update the shared header to present the four links inline at all widths and remove its drawer/button/backdrop.
4. Run focused content checks and web E2E, then web lint, unit tests, typecheck, build, and `git diff --check`. Review screenshots at 1200px and 390px; confirm no forms were submitted and no media/route contract changed.

## Verification

- Content: `bun run validate:blocks`, `bun test`, and `git diff --check`.
- Web: pinned local content worktree in the web devenv; focused `e2e/homepage-sections.spec.ts` and `e2e/browser-smoke.spec.ts`, then lint, unit tests, typecheck, build, and `git diff --check`.
- Review the exact changed-file list and leave deployment/release work unperformed pending approval.
