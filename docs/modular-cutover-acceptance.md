# Modular cutover acceptance

**Tracker:** `senshac-workspace-c714`
**Repository:** `senshac-web`
**Decision:** **Web repository acceptance passes; production cutover is blocked on owner/platform gates.**

This is the final web-owned review of the merged modular surface. It does not
activate Cloudflare Pages, Tina write access, R2, DNS, or production routing.

## Evidence

| Area | Result | Evidence |
| --- | --- | --- |
| Routes | **Pass** | `src/pages/index.astro`, `/projects/`, generated project detail paths, and `src/pages/404.astro` are built. `npm run preview:check` verifies `/` output and an HTTP 404 for `/no-such-route`. |
| Content boundary | **Pass** | `src/content/adapter.mjs` validates contract version `1`, the full pinned source revision, home content, and project metadata. The application reads `content/senshac-content-export.json`; it has no network or environment-backed content adapter. |
| Tina schema | **Pass** | `tina/config.ts` keeps articles in sibling `../senshac-content`, defines home and projects, and contains no credentials. |
| Tina lock consistency | **Pass** | Tracked `tina/tina-lock.json` contains the `articles`, `home`, and `projects` collections represented by `tina/config.ts`; the quality build regenerates/validates the Tina surface. |
| SEO/accessibility | **Automated pass; manual pending** | Semantic landmarks, language, charset, viewport, titles, descriptions, skip link, keyboard focus styles, and branded 404 output are present. Canonical URL, sitemap/robots, social metadata, structured data, browser-console, and manual keyboard/screen-reader review remain pending because the production domain and design baseline are not approved. |
| Quality gates | **Pass** | `npm run quality` is the required gate and includes lint, tests, typecheck, Tina/Astro build, preview smoke checks, and repository exclusion checks. `git diff --check` is also required. |
| Preview/production readiness | **Preview pass; production blocked** | Preview target and build contract are documented. No Pages settings, bindings, domains, tokens, or production URL are tracked. |
| Rollback | **Documented; rehearsal pending** | `docs/cutover-plan.md` preserves the archived `NacoSolutions/senshac` deployment as rollback source and documents freeze, route restore, verification, and follow-up steps. An owner must test the route switch before promotion. |
| Repository safety | **Pass** | Repository checks reject secret-like files/assignments, generated deployment configuration, and non-placeholder site configuration. Tina, Pages, R2, DNS, and cutover activation remain outside this repository. |

## Remaining owner actions before production

1. Confirm the archived deployment revision, owner, health checks, and a tested
   route-switch rollback procedure.
2. Configure Pages/Tina/R2 through protected platform and secret stores, then
   prove preview and production use the same reviewed commit.
3. Run the live preview checklist: browser console, keyboard/accessibility,
   canonical/robots/sitemap/social metadata, representative media, headers, and
   Tina authorized edit/preview behavior.
4. Promote only after those checks are attached to the release, run production
   smoke checks, and obtain explicit cutover approval.

## Scope guard

No sibling repository was edited. The export revision remains pinned to
`d90fe0dd3b1fa968d81a40bc22d3ebd7ad650e99`; changing it requires the documented
content-owner review and a new quality run.
