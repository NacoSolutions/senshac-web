# Home visual follow-up

## Goal
Use the current deployed Home content and block order as baseline. Apply requested visual changes: margin below hero; right-aligned Conócenos CTA with upward URL arrow and text-only underline; compact centered carousel arrows matching /la-trobada/; revised typography and font styling per PDF.

## Non-goals
- No content, block-order, route, confirmed-media, form, or interaction changes.
- No non-Home visual changes, merge, or deployment without passing required checks and clear approval.
- Do not weaken tests to hide visual regressions.

## Plan
1. Inspect live Home and PDF at desktop/mobile; record current content revision and exact mismatches. Inspect /la-trobada/ carousel and local arrow/underline patterns.
2. Update Hero.astro and Home-scoped styles in [lang]/index.astro: add hero-bottom breathing room; right-align requested CTA; match existing upward URL arrow; underline text only, not the whole row. Preserve CMS content and scope changes to Home.
3. Update Showcase.astro control presentation to compact, centered arrows like the live project reference. Preserve accessible names, focus/disabled styles, and existing carousel behavior.
4. Tune Home font family, size, weight, line height, and emphasis against the PDF without changing copy. Update focused browser contracts to assert the visible design and current live block order, not stale content assumptions.
5. Update docs/plans/homepage-pdf-vertical-alignment.md and relevant tests to clarify visual-only scope with live content as baseline.
6. Require local E2E to fail immediately without `TINA_LOCAL_CONTENT_PATH` or `BASE_URL`; CI runs the full suite with complete content. Verify focused local and full CI browser coverage, screenshots, build, lint, and git diff --check.

## Rollback
Revert only Home visual styles and directly related tests/plan if comparison regresses the live baseline. Preserve content and unrelated local edits.

## Open question
If PDF font identity cannot be established by inspection, pause before substituting a font.

### For Executor
Read order: this plan, existing homepage PDF plan, Hero, Showcase, Home page styles, relevant E2E, live /la-trobada/ reference.
Assumed working state: deployed block order is correct; preserve existing local CTA and Nix/browser instruction edits.
Owned files: Hero, Showcase, localized Home page, focused Home E2E and plan docs.
Verification: devenv shell -- bun run build; devenv shell -- bun run lint; focused Playwright specs; full devenv shell -- bunx playwright test; git diff --check.
