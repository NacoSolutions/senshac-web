# Editorial content boundary

`senshac-content` is the TinaCMS content repository. It owns the editorial
JSON/MDX files and translations; `senshac-web` owns the Astro application and
Tina schema. The two repositories are configured as one TinaCloud project,
with `senshac-web` as the generator repository and `senshac-content` as the
content repository.

`tina/config.ts` uses `localContentPath` for local development and CI. Its path
is relative to `tina/`, so `../../senshac-content/main` points to the sibling
checkout at `../senshac-content/main` from the web repository root. The
`dev:cms`, `tina:generate`, and `build` scripts pass this path when that sibling
checkout exists. Set `TINA_LOCAL_CONTENT_PATH` to another path relative to
`tina/` when a workspace uses a different layout.

The Cloudflare Pages build also runs `scripts/sync-editorial-content.mjs`: it
loads the reviewed immutable content revision from a sibling checkout when
available, otherwise from the public GitHub archive, and copies the content
into Astro's generated `src/content` tree. The copied editorial files are
ignored by Git.

Content updates should trigger a Pages deploy through a TinaCloud webhook (or
an equivalent Pages deploy hook). The build pin must be updated when the
deployed content revision changes; this keeps builds reproducible while the
webhook supplies the refresh trigger.

The Tina schema and generated Tina artifacts remain in `senshac-web`. The
content repository has no `tina/` directory and no Tina schema.

## Local Tina verification

With the sibling checkout available and `TINA_CLIENT_ID` and `TINA_TOKEN`
unset, run `bun run tina:generate` to index content and verify local Tina admin
generation. The `dev:cms`, `tina:generate`, and `build` scripts pass the sibling
path automatically. To regenerate the tracked lock directly, run
`TINA_LOCAL_CONTENT_PATH=../../senshac-content/main ./node_modules/.bin/tinacms dev --no-server --noWatch`.
The lock must retain the eight web-owned collections: `siteConfig`, `home`,
`about`, `services`, `contact`, `legal`, `projects`, and `translations`. Tina's
local indexing and generated schema do not need TinaCloud credentials.

The Tina CLI 3.0 toolchain declares Vite 6 and its matching esbuild range. Keep
its Vite/esbuild dependencies separate from the Astro toolchain instead of
forcing project-wide Vite 8/esbuild 0.28 overrides. Tina's generated TypeScript
currently repeats GraphQL input-filter aliases such as `StringFilter`; the
GraphQL schema itself contains each input declaration once. The incompatible
Vite 8/Rolldown dependency scan reports duplicate identifier parse errors, but
Tina treats that scan failure as non-fatal and continues to report build
completion. The compatible Tina Vite 6 dependency tree avoids that scan error;
this does not change the schema or content model.

## TinaCloud owner checks

A content owner with TinaCloud and GitHub access must still verify that all
eight collections appear in the live editor and perform a real edit that opens
a pull request against `senshac-content`. These checks exercise TinaCloud
project/repository visibility, GitHub integration permissions, and edit-to-PR
behavior; local indexing cannot prove them. They require owner-managed TinaCloud
and GitHub credentials and must not be simulated by adding credentials to this
repository.
