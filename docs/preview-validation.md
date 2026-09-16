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

## Evidence log

| Section | Date | Result | Notes / Link to build |
| --- | --- | --- | --- |
| Route behaviour | | | |
| Build output | | | |
| Fixture content | | | |
| Accessibility / SEO | | | |
| Secret boundaries | | | |
| Production exclusions | | | |

> Attach this completed table and any build logs to the corresponding acceptance
> gate in `docs/cutover-plan.md` before promoting the preview to production.
