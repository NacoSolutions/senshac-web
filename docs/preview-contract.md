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

The GitHub Actions production workflow runs for build-affecting pushes to
`main`, immutable content-publish events, and deliberate manual deployments.
It supplies `PUBLIC_SITE_URL=https://cutover.senshac.com` before building and
deploys the verified artifact to Pages. Tracker-, expertise-, documentation-,
and agent-guidance-only pushes skip a production build. Cloudflare's direct
Git production deployment is disabled so every production build receives the
canonical origin and immutable content revision from this workflow. A Pages
preview build resolves its deployment origin from `CF_PAGES_URL`. Local builds
retain `https://preview.invalid`, and a production build without an explicit
URL fails closed to that placeholder rather than emitting a deployment-specific
`pages.dev` URL. If the Pages production branch changes from `main`, set
`SENSHAC_PRODUCTION_BRANCH` to match; the workflow explicitly targets `main`.

Tina admin routing has one canonical entry point: `/admin/`. Pages redirects
`/admin` and the legacy localized `/es/admin` path to `/admin/`; no localized
admin bundle is generated. The Tina CLI writes `public/admin/index.html` and
its bridge/assets before Astro builds, and the Pages packaging step preserves
that directory in `dist/admin/`. The admin route remains outside the public
cache, and Tina's auth, media, and live-edit island routes remain handled by
the Astro integration.

The Pages preview environment must provide `NEXT_PUBLIC_TINA_CLIENT_ID` (the
non-secret Tina Cloud project ID) and `TINA_TOKEN` (the Tina Cloud read-only
token). Configure these in Tina Cloud/Pages secret settings; never commit
values, `.env` files, or tokens here. `GITHUB_BRANCH` optionally selects the
Tina branch and defaults to `main`. Pages project settings, R2 bindings,
domains, and credentials remain platform-owned and must not be added to this
repository. Without those variables, local `bun run build` uses Tina's
local/offline generator so the route and admin assets can still be verified;
that fallback is not a Cloud preview and must not be used for Pages.

The localized home page reads Tina-generated Astro content collections. The
pinned `content/senshac-content-export.json` export is consumed by the project
listing and detail routes at `/projects/` and `/projects/[slug]`. Before those
static routes render, `src/content/adapter.mjs` validates the export's
`contractVersion`, immutable `sourceRevision`, and nested home/project data.
The legacy `content/tina-fixture.json` and `content/tina-schema.json` are safe
test inputs only; they are not a Tina deployment or an editorial store. See
`docs/content-boundary.md` for the content-triggered Pages build flow.
