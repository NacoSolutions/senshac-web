# Dependency hygiene

Keep Astro, TinaCMS, and Cloudflare tooling reproducible and current within the declared project boundary.

## Actions

- Install the committed dependency graph with `bun install --frozen-lockfile`.
- Review dependency changes with `git diff -- package.json bun.lock package-lock.json`.
- Exercise the Astro and Tina toolchain with `npm run typecheck && npm run build`.
- Keep Tina generation deterministic by reviewing `tina/tina-lock.json` whenever `tina/config.ts` or schemas change.

## Acceptance check

`bun install --frozen-lockfile` and `npm run typecheck && npm run build` exit zero, and dependency diffs are intentional and lockfile-backed.
