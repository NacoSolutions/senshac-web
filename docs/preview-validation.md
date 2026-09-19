# Preview Validation Checklist

Evidence template for the Senshac Astro preview slice. Run every section
against a local build or Pages preview of the reviewed commit. Attach results
to the corresponding acceptance gate in `docs/cutover-plan.md`.

## 1. Route behaviour

- [ ] `GET /` renders without errors
  - Expected output: an `<h1>` with the title, a `<p>` with the intro, and
    a small footer referencing the editorial content boundary.
- [ ] `GET /` returns HTTP 200
- [ ] `GET /nonexistent` returns HTTP 404 (Astro default)
- [ ] No console errors in browser DevTools on page load

## 2. Build output

- [ ] `npm ci && npm run build` completes without errors
  - Command: `npm ci && npm run quality`
- [ ] Output directory `dist/` contains `index.html`
- [ ] `dist/index.html` includes `<title>Senshac</title>`
- [ ] `dist/index.html` includes `<meta name="description" content="...">`
- [ ] `dist/index.html` includes the text "Preview slice — editorial content is owned by senshac-content."

## 3. Fixture content rendering

- [ ] `GET /` displays `"Senshac"` in the `<h1>` element
- [ ] `GET /` displays `"A representative editorial fixture for the Astro preview slice."` in a `<p>` element
- [ ] Content comes from `content/tina-fixture.json`, not from environment variables or production secrets

## 4. Accessibility and SEO placeholders

- [ ] `<html lang="en">` is present in the document root
- [ ] `<meta charset="UTF-8">` is set
- [ ] `<meta name="viewport" content="width=device-width">` is set
- [ ] A visible page title (`<title>`) is set
- [ ] A `<meta name="description">` tag is present
- [ ] A header contains a link to the home page (`<a href="/">Senshac</a>`)
- [ ] Page content is reachable via semantic `<main>` and `<h1>` elements
- [ ] Placeholder comments exist for future additions:
  - `[ ]` Canonical URL meta tag (TBD — add when production domain is assigned)
  - `[ ]` Sitemap / robots policy (TBD — define in Astro config when approved)
  - `[ ]` Open Graph / Twitter card meta tags (TBD — add when design is finalised)
  - `[ ]` Structured data / schema.org markup (TBD — evaluate if applicable)

## 5. Secret boundaries

- [ ] No `.env` files are present in the working tree
- [ ] No `*.pem`, `*.key`, or `*.crt` files are present in the working tree
- [ ] `npm run lint` (secret scanner) passes with zero findings
- [ ] No `PRIVATE KEY` blocks in any tracked source file
- [ ] No `api_key`, `token`, `password`, or `secret` assignments with literal values
- [ ] Build output (`dist/`, logs) contains no credential fragments
- [ ] The lint script skips Warren runtime directories (`.pi`, `.warren`)

## 6. Explicit production exclusions

The following items are **intentionally absent** from this repository and must
be configured through platform or CI secret stores only:

- [ ] No Cloudflare Pages project settings or deployment tokens
- [ ] No DNS records, zones, or redirects
- [ ] No Cloudflare R2 bucket names, bindings, or access keys
- [ ] No TinaCMS client IDs, secrets, or API tokens
- [ ] No production `site` URL in `astro.config.mjs` (currently set to `https://preview.invalid`)
- [ ] No generated Tina schema output or client code
- [ ] No migrated code from the archived `NacoSolutions/senshac` repository beyond the approved preview slice
- [ ] No cutover activation — the archive remains the rollback source

## Deterministic final gate

Run the following from a clean checkout. `npm run quality` includes the build,
fixture-backed preview check, and `npm run repository:check`; the latter rejects
secret-like files/assignments, private-key markers, generated deployment/Tina
configuration, and a non-placeholder Astro site URL. `git diff --check` is run
separately because it checks the review diff rather than the checkout.

```sh
npm ci
npm run quality
git diff --check
```

A green run is preview evidence only. It does not approve Pages, R2, Tina
credentials, DNS, or cutover activation. The manual route, browser, SEO,
accessibility, and platform checks above remain required before promotion.

## Consolidated preview evidence

The completed child Seeds `senshac-web-91a4`, `senshac-web-c2d8`, and
`senshac-web-f3b1` establish the following preview-only evidence on the reviewed
commit:

| Evidence | Deterministic proof | Result |
| --- | --- | --- |
| Representative route | `npm run build` followed by `npm run preview:check` | Green: `dist/index.html` contains the semantic route landmarks, `Senshac` title, pinned-export intro, and editorial ownership note. |
| Pinned export ownership | `npm test` and the route source assertions | Green: `/` imports `content/senshac-content-export.json`, validates it with `adaptContentExport`, and has no environment or network adapter access. `senshac-content` remains the editorial owner. |
| Quality and exclusions | `npm run quality` and `git diff --check` | Green: lint, tests, typecheck, build, preview validation, repository secret scan, and diff whitespace checks. |
| Production boundary | `npm run repository:check` and the exclusion checklist below | Green: no credentials, Pages/R2/Tina deployment configuration, DNS, generated Tina client, or cutover activation is present. |

This is repository/build evidence, not a live HTTP or browser sign-off. The
manual route, browser-console, accessibility, SEO, media, platform, and
rollback checks remain open in the checklist above and in the acceptance gates
in `docs/cutover-plan.md`.

## Next human approval boundary

Before replacing the fixture, a human owner must approve a read-only adapter to a
pinned `senshac-content` export: its source and revision, the same validated
`{ home: { title, intro } }` shape, and explicit stale/missing/error behavior.
That review must happen before any Tina write path, Pages/R2 settings, secrets,
DNS change, production `site` URL, or cutover activation is considered. A
separate human cutover approval is still required after the full preview and
platform acceptance gates pass.

## Evidence log

| Section | Result | Notes |
| --- | --- | --- |
| Route behaviour | Green for built-route assertions | `npm run preview:check`; live HTTP/404 and browser checks remain manual. |
| Build output | Green | `npm run build`; `dist/index.html` contains the expected title and metadata. |
| Fixture content | Green | `npm test` and `npm run preview:check`; fixture-backed and ownership note rendered. |
| Accessibility / SEO | Automated placeholders present | Manual checklist remains open. |
| Secret boundaries | Green | `npm run repository:check` and `npm run lint`. |
| Production exclusions | Green | `npm run repository:check`; no cutover activation. |

> Attach the command output and reviewed commit to the corresponding acceptance
> gate in `docs/cutover-plan.md` before promoting the preview to production.
