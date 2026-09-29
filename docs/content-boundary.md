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

Every build runs `scripts/sync-editorial-content.mjs` and copies editorial
files into Astro's generated `src/content` tree. A local sibling checkout
supplies its `HEAD`; Cloudflare Pages builds resolve `senshac-content` `main`
through the GitHub API, then download that immutable commit archive. The script
logs the resolved 40-character SHA. Set `SENSHAC_CONTENT_REVISION` to build an
explicit revision for reproducibility or rollback. The copied editorial
files are ignored by Git.

TinaCloud writes editorial commits to `senshac-content`. Its
`dispatch-web-content-deploy` workflow watches editorial paths on `main`,
validates that exact SHA, then sends a `repository_dispatch` to
`senshac-web`. The web repository's `deploy-pages-content` workflow checks out
web `main`, builds with the supplied content SHA, and uploads the Pages
artifact with Wrangler. Content updates create no commits or pull requests in
this repository. Store `CLOUDFLARE_API_TOKEN` as a GitHub Actions secret and
`CLOUDFLARE_ACCOUNT_ID` as a repository variable in `senshac-web`.

Web source pushes continue through Cloudflare Pages Git integration; these
builds resolve the latest content `main` and log the immutable SHA they use.
Content-triggered builds use the dispatched SHA, so the deployment workflow
and run summary preserve exact source provenance.

The Tina schema and generated Tina artifacts remain in `senshac-web`. The
content repository has no `tina/` directory and no Tina schema.

## Local Tina verification

With the sibling checkout available and `TINA_CLIENT_ID` and `TINA_TOKEN`
unset, run `bun run tina:generate` to index content and verify local Tina admin
generation. The `dev:cms`, `tina:generate`, and `build` scripts pass the sibling
path automatically. The Tina CLI runs from its isolated `tools/tina` dependency tree; the wrapper installs that lockfile and verifies it resolves Vite 6 before invoking the CLI from the repository root. To regenerate the tracked lock directly, run
`TINA_LOCAL_CONTENT_PATH=../../senshac-content/main node scripts/tina-cli.mjs dev --no-server --noWatch`.
The lock must retain the eight web-owned collections: `siteConfig`, `home`,
`about`, `services`, `contact`, `legal`, `projects`, and `translations`. Tina's
local indexing and generated schema do not need TinaCloud credentials.

Astro/Cloudflare uses the root Vite 8 toolchain and its lockfile overrides;
that produces the `dist/_worker.js/index.js` entry required by Pages. Tina CLI 3.0
runs from the separate `tools/tina` package/lockfile, where its Vite 6 dependency
is not rewritten by the root overrides. This avoids Tina's non-fatal duplicate
GraphQL filter scan errors without changing the schema or content model, while
preserving the Astro worker output used by Pages.

## TinaCloud owner checks

A content owner with TinaCloud and GitHub access must still verify that all
eight collections appear in the live editor and perform a real edit that opens
a pull request against `senshac-content`. These checks exercise TinaCloud
project/repository visibility, GitHub integration permissions, and edit-to-PR
behavior; local indexing cannot prove them. They require owner-managed TinaCloud
and GitHub credentials and must not be simulated by adding credentials to this
repository.
