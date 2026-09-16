# Senshac Web

Minimal preview skeleton for the Senshac Astro/TinaCMS web application.

The legacy `NacoSolutions/senshac` repository is frozen. During the planned
cutover, the web application, TinaCMS generator configuration, Cloudflare Pages
integration, and web quality gates will be copied here in a focused change.

## Status

This repository contains only the bounded, non-production preview slice: one
Astro route, deterministic quality gates, and a non-secret Tina content
contract. It is not a production deployment.

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

The preview slice intentionally excludes production Pages configuration, DNS,
R2 bindings, credentials, generated Tina configuration, and the archived
application. Do not add those items here without the relevant cutover gate.
