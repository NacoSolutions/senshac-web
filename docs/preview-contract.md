# Preview contract

This seed is intentionally local and non-production. A future Cloudflare Pages
preview must build the reviewed commit with `npm ci` followed by `npm run
quality`. Pages project settings, environment variables, R2 bindings, domains,
and credentials are platform-owned and must not be added to this repository.

The representative `/` route reads the pinned
`content/senshac-content-export.json` export from the separate
`senshac-content` repository. `src/content/adapter.mjs` validates its
`contractVersion`, immutable `sourceRevision`, and nested content before the
static route is rendered. The validated values are passed to
`src/components/HomePreview.astro`. The legacy `content/tina-fixture.json` and
`content/tina-schema.json` are safe test inputs only; they are not a Tina
deployment or an editorial store. See `docs/content-boundary.md` for the
refresh and review procedure.
