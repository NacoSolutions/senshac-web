# Senshac Web

Placeholder repository for the Senshac Astro/TinaCMS web application.

The legacy `NacoSolutions/senshac` repository is frozen. During the planned
cutover, the web application, TinaCMS generator configuration, Cloudflare Pages
integration, and web quality gates will be copied here in a focused change.

## Status

This repository is intentionally non-production and contains no deployable
application yet.

## Web cutover contract

When cutover is approved:

- **Astro owns the web application** in this repository; the archived
  `NacoSolutions/senshac` monorepo remains the rollback source.
- **TinaCMS owns editorial schemas and content boundaries.** Tina configuration
  may integrate the sibling `senshac-content` repository, but application code
  and editorial content remain separate concerns.
- **Cloudflare Pages owns deployment** of the Astro site. R2 owns media
  storage and delivery integration; media credentials and bindings must be
  configured through the deployment environment, never committed here.
- **Preview smoke checks** must pass before promotion, including the build,
  routes, Tina editing/preview behavior, media, SEO, and accessibility. Repeat
  the relevant checks against production after promotion.
- **Rollback** means restoring the archived monorepo deployment and routing
  while the new Pages release is investigated; preserve the archive until the
  production smoke checks and rollback path are verified.

Until that work begins, preserve this placeholder: do not copy application code,
TinaCMS credentials, Cloudflare credentials, R2 secrets, or generated
configuration into this repository.
