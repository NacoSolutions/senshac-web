# Tina, Astro, and Cloudflare

Keep editorial data, Astro rendering, and Cloudflare Pages delivery as clear cooperating boundaries.

## Actions

- Run local Tina and Astro development with `npm run dev` and inspect the generated preview route.
- Validate the Tina schema and Astro integration with `npm run typecheck && npm run build`.
- Keep article source in the sibling `senshac-content` repository and review `tina/tina-lock.json` after schema changes.
- Deploy a validated static output with `wrangler pages deploy dist --project-name "$CLOUDFLARE_PROJECT"` using platform-provided credentials and bindings.

## Acceptance check

Tina local editing, `npm run typecheck`, `npm run build`, and `npm run preview:check` succeed; the Pages deployment consumes the reviewed `dist/` output with platform-managed secrets.
