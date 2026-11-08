# Tina, Astro, and Cloudflare

Keep editorial data, Astro rendering, and Cloudflare Pages delivery as clear cooperating boundaries.

## Actions

- Run local Tina and Astro development with `bun run dev:cms` and inspect the generated preview route. This repository script invokes `tinacms dev -c "astro dev"`; `bun run dev` is not defined here.
- Validate the Tina schema and Astro integration with `bun run quality`.
- Keep article source in the sibling `senshac-content` repository. After every
  `tina/config.ts` change, run `bun run dev:cms` once with that sibling checkout
  available so Tina regenerates `tina/tina-lock.json`; review and commit the
  lockfile, then run `bun run quality`. `tinacms build` alone does not generate
  the lockfile. Use a whitespace-only lockfile change only when the schema is
  already verified and the TinaCloud branch needs an explicit **Reindex** action.
- Use a production build followed by Wrangler Pages local preview for Pages-runtime smoke checks; use the Tina/Astro dev server for editorial preview.
- Deploy validated static output with `wrangler pages deploy dist --project-name "$CLOUDFLARE_PROJECT"` using platform-provided credentials and bindings.

## Playwright browser in Nix workspaces

When Playwright cannot launch its cached browser (for example, `spawn .../chrome-headless-shell ... ENOENT`), use the Nix-provided headless shell instead of reinstalling system packages. Locate it with `find /nix/store -maxdepth 3 -type f -name chrome-headless-shell 2>/dev/null | head`, then set `PLAYWRIGHT_CHROMIUM_PATH` to that executable when running `bunx playwright test`. The Playwright config honors this variable. E2E tests build and serve Pages output with Wrangler by default; use `bun run dev:cms` only for Tina/Astro editorial preview.


## Nix `workerd` spawn failures

If Astro or Wrangler reports `ENOENT` spawning the installed `workerd`, check whether its ELF interpreter (`/lib64/ld-linux-x86-64.so.2`) is unavailable in the Nix environment. A temporary wrapper can invoke the current worktree binary through a Nix glibc loader; set `MINIFLARE_WORKERD_PATH` to the wrapper for build/preview commands. Resolve paths at runtime, keep the wrapper in `/tmp`, and do not replace the package binary. This only addresses process startup; builds can still stall during Astro compilation, so record timeouts as unverified rather than success.
## Acceptance check

Tina local editing via `bun run dev:cms`, the generated lockfile diff when schemas change, `bun run quality`, and `bun run preview:check` succeed; the Pages deployment consumes reviewed `dist/` output with platform-managed secrets.