# Browser smoke checks

The Playwright smoke suite covers the production-facing browser boundary:
localized pages, representative blocks, Tina field markers for live editing,
the admin entry point, and the authenticated `/tina-island/*` boundary.

Run against a deployed Pages preview or cutover candidate with:

```sh
BASE_URL=https://<preview-host> bun run test:e2e
```

For a fast local path, omit `BASE_URL`. Playwright reuses an existing `dist/`
preview when available; otherwise it builds the site and starts the Cloudflare Pages worker locally:

```sh
bun run test:e2e
```

The suite checks route and protocol wiring without attempting a Tina write. A
successful Tina edit remains an owner-authenticated preview/cutover check and
must be recorded with the deployed preview evidence.
