# Home visual refinement against current deployment

## Goal
Keep the current live ES/CA/EN Home content and block order. Match the supplied PDF and user feedback with visual-only adjustments: space below the hero, the right-aligned underlined “Conócenos” link with upward URL arrow, compact centered carousel arrows, and corrected typography/font use/style.

## Non-goals
- Do not change content data, locale copy, block order, routes, media, forms, carousel interaction, or non-Home styling.
- Do not revive the prior content-order task or its obsolete 10-block assumptions.
- Do not merge or deploy until required PR checks pass and approval is clear.

## Baseline and evidence
- The current deployed site is the baseline for live block order and behavior. The supplied WEB HOME PAGE.pdf is the visual reference.
- CTA presentation: “Conócenos”, upward URL arrow at right, right aligned, underline limited to text; remove any strip-wide rule.
- Carousel arrow reference: https://senshac.com/la-trobada/. Keep content, accessible labels, keyboard/focus behavior, disabled state, and scrolling unchanged.
- Hero.astro is shared; scope presentation changes to Home.
- devenv.nix exposes PLAYWRIGHT_CHROMIUM_PATH for Nix headless shell. E2E builds and serves Pages output with Wrangler; bun run dev:cms is only Tina/Astro editorial preview.

## Owned files
- Hero.astro and [lang]/index.astro: Home-only hero gap and CTA presentation.
- Showcase.astro: carousel control placement/size only.
- design-reference-layout.spec.ts and homepage-sections.spec.ts: assert live baseline and requested visuals; remove only stale assumptions contradicted by verified live output.
- This plan and docs/plans/home-visual-followup.md.

## Steps and gates
1. Capture current deployed ES/CA/EN Home at desktop/mobile and inspect PDF; record live block order and visual measurements. Inspect /la-trobada/ controls and existing URL-arrow/underlined-link patterns. No source edits until reference patterns are identified.
2. Add/update focused browser assertions for hero-to-next-section spacing; CTA label, right edge, arrow, text-only underline/no full-width border; centered compact carousel controls; representative font family/size/weight/line-height/style. Keep content and interaction assertions tied to current live order.
3. Implement minimal Home-scoped styles in Hero.astro/[lang]/index.astro, carousel styles in Showcase.astro, and typography adjustments. Reuse established arrow/font/link styles; no dependencies or content changes.
4. Update old E2E assumptions only when direct live observation proves them stale. Retain useful geometry/behavior coverage adapted to current block sequence.
5. Local E2E must fail fast without `TINA_LOCAL_CONTENT_PATH` or `BASE_URL`; CI runs the complete suite with full content. Verify focused local and full CI browser checks, desktop/mobile screenshots, build, lint, and git diff --check. Preserve unrelated edits and remove generated artifacts.

## Rollback
Revert only these Home visual styles and direct plan/test changes if screenshots or contracts regress current live baseline. Preserve content and unrelated worktree edits.

## Open question
If PDF font identity cannot be established from supplied assets/reference, report ambiguity rather than guessing.

### For Executor
Read order: this plan; docs/plans/home-visual-followup.md; Hero.astro; Showcase.astro; [lang]/index.astro; focused E2E specs; live Home and /la-trobada/.
Assumed state: deployed block order is correct; current CTA CSS and Nix browser instructions are uncommitted and must be preserved/reconciled.
Verification: devenv shell -- bun run build; devenv shell -- bun run lint; devenv shell -- bunx playwright test e2e/design-reference-layout.spec.ts e2e/homepage-sections.spec.ts; full devenv shell -- bunx playwright test; git diff --check.
