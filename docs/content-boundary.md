# Editorial content boundary

`senshac-content` is the TinaCMS content repository. It owns the editorial
JSON/MDX files and translations; `senshac-web` owns the Astro application and
Tina schema. The two repositories are configured as one TinaCloud project,
with `senshac-web` as the generator repository and `senshac-content` as the
content repository.

`tina/config.ts` uses `localContentPath` for local development and CI. The
Cloudflare Pages build also runs `scripts/sync-editorial-content.mjs`: it
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
