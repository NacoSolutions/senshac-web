# Editorial content boundary

The site consumes editorial pages, legal files, and projects from the sibling
`senshac-content` repository. `scripts/sync-editorial-content.mjs` uses the
pinned content revision, preferring a sibling checkout for local work and a
public GitHub archive during CI/Pages builds. Generated files remain ignored;
the content repository remains the editorial source of truth. For local Tina
editing, check out `NacoSolutions/senshac-content` beside this repository. The
small pinned export is
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

To refresh deployed editorial content, a maintainer must update the immutable
`SENSHAC_CONTENT_REVISION` pin after reviewing the corresponding
`senshac-content` commit. The revision must be the full commit ID, not a branch
or tag. Run the quality gate, inspect the rendered preview, and have an owner
review the content source and deployment diff before merging.

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
