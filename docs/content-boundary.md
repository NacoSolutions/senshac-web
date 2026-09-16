# Editorial content boundary

The preview consumes a deliberately small, repository-local representation of
an export from the sibling `senshac-content` repository. It is the fixture at
`content/tina-fixture.json` and currently has this shape:

```json
{
  "home": {
    "title": "string, non-empty",
    "intro": "string, non-empty"
  }
}
```

`src/content/contract.mjs` validates the shape at the Astro application
boundary. Unknown fields are rejected so additions to the sibling export are
reviewed rather than silently ignored. The home preview component then receives
only the validated `title` and `intro` values. This keeps the route static-first
and makes malformed content fail the build.

## Next integration boundary

The next integration should replace the fixture import with a reviewed,
read-only adapter for a pinned `senshac-content` export. That adapter must
return this same validated shape and define its revision/error behavior. TinaCMS
credentials, write access, Cloudflare Pages configuration, R2 bindings, and a
full content migration remain out of scope until the editorial workflow and
platform gates in `docs/cutover-plan.md` are approved.
