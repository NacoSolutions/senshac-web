# Tina-controlled site typography

## Goal

Give editors a small, sitewide TinaCMS control for approved typography pairings while keeping the current Senshac appearance as the default. Preserve semantic content fields and the existing rich-text editing model; do not expose arbitrary CSS, colors, font uploads, or layout controls.

## Accepted scope

- Add one Typography preset control to Site Configuration with three named, reviewed pairings:
  - Senshac (default): Sinteca body + Jozsika display/headings; matches current styling.
  - Sinteca: Sinteca for both roles.
  - Editorial: Jozsika body + Sinteca display/headings.
- Map these enum values to local, already-supported font assets and CSS variables. Reject/fallback unknown values to the current Senshac pairing.
- Restrict long-form editorial rich-text toolbars to supported safe formatting: headings, bold, italic, strikethrough, links, lists, and quotes. Keep navigation, buttons, form copy, and accessibility labels as constrained semantic fields or code-owned strings, not rich-text HTML.
- Add the preset to the content-owned site config with the current-style default, and keep the web runtime backward-compatible with content revisions that omit the field.
- Apply the selected font roles across the active layouts, including the legacy BaseLayout, while keeping the brand wordmark's deliberately fixed font treatment.

## Non-goals

- Migrating all hard-coded UI copy or every short string to Tina; this follows the agreed recommendation to keep operational/accessibility strings semantic and constrained.
- Per-element font selection, arbitrary font size/weight/color/alignment/line-height controls, CSS injection, uploaded fonts, copy changes, URL changes, or deployment.
- Changing content order, page layout, or the default visual output.

## Repositories and ownership

- senshac-web: Tina field schema, Astro validation/defaulting, runtime preset mapping, CSS tokens/layout consumption, editor guidance, and browser/unit contracts.
- senshac-content: default config/site.json value, site-config JSON Schema, and content-contract tests.
- Workspace coordination Seed: senshac-workspace-789c.
- Web implementation Seed: senshac-web-e723.
- Content configuration Seed: senshac-content-240f.

Merge order, if later approved: web support first, then content config. Do not merge either branch or trigger deployment without explicit approval.

## Implementation steps

1. Add a failing web unit test for preset normalization/mapping and a browser contract for the default and switched CSS role variables.
2. Add a failing content contract assertion for the approved preset enum and default value.
3. Add the content schema enum and typography.preset = senshac to senshac-content/config/site.json; run focused and full content quality gates.
4. Add the Tina Site Configuration field with human-readable options/help text and a default; restrict every rich-text toolbar to supported safe formatting; update Astro site-config validation with a backward-compatible default; regenerate the Tina schema lock using the repository's normal workflow.
5. Add a single allowlisted preset resolver, expose a stable data-typography-preset on both layouts, and map body/display roles through shared CSS variables. Update existing global/Uno font-family references to consume those variables, preserving the brand wordmark and current default.
6. Add focused tests for schema/Tina options, default fallback, CSS role mapping, and layout coverage. Verify actual Tina editor selection and rendered desktop/mobile output without changing copy or content order.
7. Review the complete diff, run repository quality gates and Seeds Doctor in both focused repos, and record the workspace cross-repository handoff. Keep both PRs unmerged and do not deploy pending separate approval.

## Verification gates

- Content: bun run quality:content, bun run lint, git diff --check, and seeds doctor.
- Web: bun run lint, bun test, bun run typecheck, production build with the supported content path, Tina schema lock validation, focused Playwright desktop/mobile contracts, git diff --check, and seeds doctor.
- The Tina browser check must show the three labeled options and permit switching the preset. Browser verification must use a fresh build; static tests or test discovery alone are not sufficient.
- Confirm the default site's computed body/display font families remain Sinteca/Jozsika, and that each alternate preset changes only the intended font roles.

## Risks and mitigations

- Font files have different supported weights. Use only reviewed pairings and existing local font assets; keep weight, size, and layout CSS-owned.
- Older content exports may omit the new object. Default to the current Senshac pairing in the Astro schema/resolver.
- Legacy layout styles may bypass shared tokens. Audit direct font-family declarations and test both layouts; preserve the logo's fixed styling intentionally.
- A content commit can trigger the web content-publication workflow. Keep the content change in an unmerged PR until web support is merged and the owner separately authorizes publication.

## Decisions to revisit only with evidence

- Whether more preset options are useful; add no new option without a rendered review and proof it uses a supported font/weight combination.
- Whether to expose per-field size or color controls; excluded from this bounded version because they can break responsive hierarchy and accessibility.
