# Legacy parity audit — seed `senshac-workspace-c714`

**Audit date:** 2026-09-22 (UTC, from deployment responses)
**Scope:** read-only comparison of the frozen `NacoSolutions/senshac` repository, this checkout (`senshac-web`), and `https://preview.senshac.com` / `https://cutover.senshac.com`. No production or editorial repository changes were made.

## Evidence and limits

- Legacy checkout: `NacoSolutions/senshac` HEAD `b46b93362d944dac324797ef8a2c9ca71f9e5173` (`2026-09-16`, `chore: route dependency maintenance through Warren (#59)`). It was cloned read-only from GitHub for this audit.
- Current checkout: HEAD `3148920a80a2c8bfe20dd82a4cd41854960fd133` (`origin/main`). The preview deployment did not expose a commit SHA in response headers or HTML; the cutover deployment did not expose one either. Deployment identity is therefore **unverified**.
- Live checks used `curl -L` for route status/redirects, response headers, HTML metadata and asset links. Browser, keyboard, HLS playback, form submission, Tina editing, Cloudflare dashboard bindings, cache-hit behavior over time, and authenticated admin behavior remain **unverified** unless noted below.
- The legacy and current source trees have the same localized page route inventory, project/works routes, API routes, Tina island route, and generated text endpoints. The notable source deployment difference is current `astro.config.mjs` uses `site: 'https://preview.invalid'`; legacy uses `PUBLIC_SITE_URL || 'https://senshac.com'`.

## Route matrix

`200` means the final response after redirects. `redirect` records the final URL; it is not treated as an equivalent route without product confirmation.

| Surface | Source parity (legacy → current) | Preview | Cutover | Finding |
|---|---|---:|---:|---|
| `/` | present | `302 → /es/`, 200 | `302 → /es/`, 200 | Matches localized default routing. |
| `/es/`, `/ca/`, `/en/` home | present | 200 each | 200 each | Titles and localized HTML present. |
| `/{lang}/studio/` | present | 200 | 200 | Representative route responds. |
| `/{lang}/methods/` | present | 200 | 200 | Representative route responds. |
| `/{lang}/services/` | present | `302 → /{lang}/methods` | same observed behavior | **Changed/needs confirmation:** services is not an independent live page. |
| `/{lang}/about/` | present | `302 → /{lang}/studio` | same observed behavior | **Changed/needs confirmation:** about is not an independent live page. |
| `/{lang}/projects/` | present | `302 → /{lang}/works` | same observed behavior | Alias behavior; project index is exposed as works. |
| `/{lang}/works/` and representative slugs | present | 200 | 200 | Works index and project links render. |
| `/{lang}/contact/` | present | 200 | 200 | Form markup is present; POST is unverified. |
| `/{lang}/privacy-policy/`, `legal-notice/` | present | 200 each | 200 each | Legal surfaces respond. |
| `/admin/` | present | **404** (4,300 bytes) | **404** (65,972 bytes) | **P0 blocker:** Tina admin is not reachable at the canonical route. |
| `/llms.txt`, `/llms-full.txt` | present | 200 / 200 | 200 / 200 | Text endpoints respond. |
| `/robots.txt`, `/sitemap.xml` | present | 200 / 200 | 200 / 200 | Sitemap/robots respond; content-level parity not fully reviewed. |
| unknown route | 404 surface present | 404 | 404 | Basic branded 404 behavior responds. |

The checks above were run for representative Spanish routes. The three language home pages and the localized source route inventory were checked for `es`, `ca`, and `en`; a full browser-by-browser language interaction comparison is **unverified**.

## Feature and deployment matrix

| Area | Legacy baseline | Current / preview evidence | Cutover evidence | Classification / severity |
|---|---|---|---|---|
| Page structure and content | Same Astro route/component inventory in the two source checkouts. | Localized home/studio/methods/works/contact/legal HTML renders. | Same route status pattern. | **Parity observed**, visual regression unverified. |
| Navigation and language selector | Shared Header/Footer components and localized routes. | Links include `/ca/`, `/en/`, `/es/`, works and legal; controls have labels such as `Select language, current: ES`, `Toggle menu`. | HTML renders. | **Parity likely**, keyboard/focus behavior unverified. |
| Header/footer states | Legacy/current source include chrome presets and transparent/default header handling. | Home contains transparent header controls and footer markup. | Same content surface. | **Unverified** at scroll, breakpoint, focus, and menu states. |
| Favicon and manifest | Legacy has `favicon.ico`, 32px, 192px, and Apple touch icon; no manifest observed. | Preview: all four required root assets are 200 (`image/vnd.microsoft.icon` or `image/png`); `/manifest.webmanifest` is 404. | All four required assets are 404. | Preview assets **pass**; cutover root branding is **P0 blocker**. Current tracked `public/` does not contain those four files, so source/build provenance is **unverified**. |
| Fonts / R2 media | Legacy uses `media.senshac.com` media contract and the same R2-oriented components. | HTML references Jozsika/Sinteca fonts, responsive images and HLS manifests under `media.senshac.com`. | Same site HTML. | URL presence observed; font/image/HLS request status and playback **unverified**. |
| HLS/video | Legacy/current include `HlsVideo` and media manifest URLs. | Home emits manifests such as `/videos/redesign/horizontal-1-corto/master.m3u8` and Instagram manifests. | Same page family. | **Unverified:** no successful manifest/segment/player/browser test was completed. |
| Tina admin/live editing/islands | Legacy has `/admin`, Tina island, generated admin bundle and S3 media routes. | Source retains these routes; preview `/admin/` is 404. | `/admin/` is 404. | **P0 blocker** for editorial cutover; island/auth editing behavior unverified. |
| Forms | Localized contact API exists in both source trees. | Contact page/form markup is present. | Contact page/form markup is present. | POST, validation, mail delivery, abuse controls and error UX **unverified**. |
| SEO/canonical/hreflang/social | Legacy config supports production site URL. | Preview HTML has canonical `https://senshac.com/{lang}/`, `es/ca/en/x-default` alternates, and social/SEO markup. No `preview.invalid` found in preview HTML. | Cutover HTML contains `https://preview.invalid/` canonical/alternate URLs. | **P0 blocker:** cutover publishes invalid canonical URLs. Source config still defaults to `preview.invalid`; promotion must supply and verify `PUBLIC_SITE_URL`. |
| Security headers / CORS | Legacy has tracked `public/_headers` with link headers and route cache rules. | Preview: `x-content-type-options: nosniff`, HSTS, strict referrer policy, wildcard ACAO; localized pages use `s-maxage=300, stale-while-revalidate=86400`. | Cutover: HSTS, referrer policy, wildcard ACAO; localized pages use `must-revalidate`; no `x-content-type-options` observed on the sampled page. | **High:** header contract differs; review before promotion. Wildcard CORS may be intentional for public media but needs confirmation. |
| Cloudflare Pages / R2 / KV | Legacy and current `wrangler.jsonc` retain Pages output, `MEDIA_RAW` R2 and `SESSION` KV bindings. | Live binding identity cannot be proven from public responses. | Same limitation. | **Unverified:** dashboard binding, worker execution, auth/session and R2 access need deployment evidence. |
| Redirects / cache | Legacy `_redirects` and `_headers` are tracked. | `/`, services, about, and projects aliases redirect as observed; preview cache policy differs by route. | Root redirects, but cache/header behavior differs. | Redirect map is **partially observed**; full legacy deployment comparison unverified. |
| Performance / basic asset failures | Legacy includes asset and PageSpeed checks. | HTML is 78–108 KB for representative routes; CSS, responsive media, fonts and HLS URLs are emitted. | HTML is 65–125 KB for sampled responses. | No Lighthouse or browser waterfall run; failed resource count and performance budgets **unverified**. |
| Accessibility | Source includes skip link and labelled menu/language/video controls. | Labels and skip link are present in HTML. | Same surface. | Semantic/keyboard/focus/contrast/screen-reader behavior **unverified**. |

## Root asset evidence

| URL | Preview | Cutover |
|---|---:|---:|
| `/favicon.ico` | 200, `image/vnd.microsoft.icon`, 15,086 bytes | **404** |
| `/favicon-32x32.png` | 200, `image/png`, 710 bytes | **404** |
| `/favicon-192x192.png` | 200, `image/png`, 3,830 bytes | **404** |
| `/apple-touch-icon.png` | 200, `image/png`, 3,432 bytes | **404** |

## Prioritized promotion blockers

1. **P0 — Do not promote cutover:** `/admin/` is 404 on both deployments, so Tina editorial/live editing cannot be accepted.
2. **P0 — Do not promote cutover:** cutover emits `https://preview.invalid/` canonical and hreflang URLs. Set the production site URL at deployment and recheck every language and representative route.
3. **P0 — Do not promote cutover:** all four root brand icons are 404. Restore them in the deployed Pages artifact and verify content types.
4. **P1 — Resolve route intent:** confirm whether `services → methods`, `about → studio`, and `projects → works` are approved intentional aliases or legacy parity regressions; document redirects if intentional.
5. **P1 — Verify deployment contract:** provide commit IDs for both live deployments and prove Pages output, `MEDIA_RAW` R2, `SESSION` KV, Tina auth/islands, HLS segments, fonts/images, form POSTs, CORS, headers, cache behavior, and failed-resource/performance results.

## Audit conclusion

The source route/component surface is substantially aligned with the archived repository, and preview has working localized pages, SEO host URLs, and root icon responses. The cutover deployment is **not promotion-ready** because admin, canonical metadata, and root branding fail. Several requested runtime behaviors remain unverified rather than marked regressions; they require authenticated/browser/network evidence before domain cutover.
