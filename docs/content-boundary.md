# Editorial content boundary

The preview consumes a deliberately small, repository-local, read-only export
from the sibling `senshac-content` repository. Tina's `articles` collection
likewise points at that sibling through `localContentPath: '../senshac-content'`;
article Markdown/MDX files are never owned by or copied into `senshac-web`.
For local Tina editing, check out `NacoSolutions/senshac-content` beside this
repository. CI and preview builds use the committed export and do not require
that checkout or any credentials. The pinned export is
`content/senshac-content-export.json` and uses this envelope:

```json
{
  "contractVersion": 1,
  "sourceRevision": "d90fe0dd3b1fa968d81a40bc22d3ebd7ad650e99",
  "content": {
    "home": {
      "title": "string, non-empty",
      "intro": "string, non-empty"
    }
  },
  "projects": [
    {
      "title": "string, non-empty",
      "slug": "lowercase-slug",
      "description": "string, non-empty",
      "featured": "boolean",
      "tags": ["string"]
    }
  ]
}
```

`src/content/adapter.mjs` validates the envelope and delegates the content
shape to `src/content/contract.mjs`. It returns explicit `ready`, `stale`,
`missing`, or `error` results; the route fails its build for every result other
than `ready`. No network or credential is involved. The existing
`content/tina-fixture.json` remains only as a test input for the shape contract
and adapter tests.

## Refresh and review procedure

To refresh the preview export, a maintainer must obtain a new immutable
`senshac-content` commit, export the approved contract from that revision, and
update both `sourceRevision` and the JSON payload in one reviewed change. The
revision must be the full commit ID (not a branch or tag), and the adapter pin
in `src/content/adapter.mjs` must match it. Run `npm run quality`, inspect the
diff for editorial scope and secrets, and have an owner review the source
revision, contract version, and rendered preview before merging. Do not refresh
it from a network during an application build.

TinaCMS credentials, write access, Cloudflare Pages configuration, R2 bindings,
and a full content migration remain out of scope until the editorial workflow
and platform gates in `docs/cutover-plan.md` are approved.

## Preview verification

The representative `/` route and the `/projects/` routes import only the pinned
export, pass it through `adaptContentExport`, and supply validated values to the
preview components. Project detail paths are generated from the exported slugs.
`npm run quality` rebuilds the route and `npm run preview:check` re-validates
those pinned values against `dist/index.html`, including the visible
`senshac-content` ownership note. The route wiring test also rejects runtime
environment or network adapter access. No credentials, Tina client, Pages/R2
configuration, or write adapter is part of this boundary.
