# Preview contract

This seed is intentionally local and non-production. A future Cloudflare Pages
preview must build the reviewed commit with `npm ci` followed by `npm run
quality`. Pages project settings, environment variables, R2 bindings, domains,
and credentials are platform-owned and must not be added to this repository.

The representative `/` route reads `content/tina-fixture.json`, which models the
small contract exchanged with the separate `senshac-content` repository. The
fixture is validated by `src/content/contract.mjs` before the static route is
rendered, and the validated values are passed to `src/components/HomePreview.astro`.
The fixture and `content/tina-schema.json` are safe test inputs only; they are
not a Tina deployment or an editorial store. See `docs/content-boundary.md` for
the fixture shape and the next read-only adapter boundary.
