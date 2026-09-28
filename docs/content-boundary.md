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
into Astro's generated `src/content` tree. Its reviewed default revision is
`862e2089cf1c80ee1fdc9ec7df6fc8ecef19e005`; set
`SENSHAC_CONTENT_REVISION` to override that pin for local verification. The
copied editorial files are ignored by Git.

TinaCloud writes editorial commits to `senshac-content`. Its
`update-web-content-revision` workflow watches relevant content paths on
`main` and opens or refreshes a focused PR here with the exact source SHA in
`scripts/sync-editorial-content.mjs`. Merge that PR after the web checks pass;
Cloudflare Pages then builds the pinned revision from the resulting `main`
commit. A bare deploy-hook rebuild is not used for this flow because the
revision must advance along with the build trigger.

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
