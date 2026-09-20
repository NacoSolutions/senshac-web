# Preview contract

This seed is intentionally local and non-production. The modular Cloudflare
Pages target is documented below for the eventual platform setup:

| Setting | Target |
| --- | --- |
| Pages project | `senshac-web` |
| Production branch | `main` |
| Preview branch | `cutover` |
| Build command | `bun install --frozen-lockfile && bun run build` |
| Output directory | `dist` |
| Preview URL | `https://cutover.senshac-web.pages.dev` |
| Production URL | `https://cutover.senshac.com` |

Pages must build the reviewed commit with that command. The build runs
`tinacms build` before `astro build`, so the generated Tina admin is included
at `/admin/`. Run `bun run quality` as the repository quality gate before
promoting a reviewed commit. This target is documentation only: Pages settings,
custom domains, DNS, bindings, and credentials remain platform-owned and are
not configured here.

The Pages preview environment must provide `NEXT_PUBLIC_TINA_CLIENT_ID` (the
non-secret Tina Cloud project ID) and `TINA_TOKEN` (the Tina Cloud read-only
token). Configure these in Tina Cloud/Pages secret settings; never commit
values, `.env` files, or tokens here. `GITHUB_BRANCH` optionally selects the
Tina branch and defaults to `main`. Pages project settings, R2 bindings,
domains, and credentials remain platform-owned and must not be added to this
repository. Without those variables, local `bun run build` uses Tina's
local/offline generator so the route and admin assets can still be verified;
that fallback is not a Cloud preview and must not be used for Pages.

The representative `/` route reads the pinned
`content/senshac-content-export.json` export from the separate
`senshac-content` repository. `src/content/adapter.mjs` validates its
`contractVersion`, immutable `sourceRevision`, and nested content before the
static route is rendered. The validated values are passed to
`src/components/HomePreview.astro`. The legacy `content/tina-fixture.json` and
`content/tina-schema.json` are safe test inputs only; they are not a Tina
deployment or an editorial store. See `docs/content-boundary.md` for the
refresh and review procedure.
