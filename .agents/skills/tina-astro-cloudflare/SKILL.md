# Tina, Astro, and Cloudflare

Keep editorial data, Astro rendering, and Cloudflare Pages delivery as clear cooperating boundaries.

## Actions

- Run local Tina and Astro development with `bun run dev` and inspect the generated preview route.
- Validate the Tina schema and Astro integration with `bun run quality`.
- Keep article source in the sibling `senshac-content` repository. After every
  `tina/config.ts` change, run `bun run dev` once with that sibling checkout
  available so Tina regenerates `tina/tina-lock.json`; review and commit the
  generated lockfile, then run `bun run quality`. `tinacms build` alone does not
  generate the lockfile. Use a whitespace-only lockfile change only when the
  schema is already correct and the TinaCloud branch needs an explicit
  **Reindex** action.
- Deploy a validated static output with `wrangler pages deploy dist --project-name "$CLOUDFLARE_PROJECT"` using platform-provided credentials and bindings.

## Acceptance check

Tina local editing via `bun run dev`, the generated lockfile diff, `bun run quality`, and `npm run preview:check` succeed; the Pages deployment consumes the reviewed `dist/` output with platform-managed secrets.
