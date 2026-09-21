# Web performance

Keep the Astro site fast, cacheable, and efficient on Cloudflare Pages.

## Actions

- Build the static site with `npm run build` and inspect generated output in `dist/`.
- Validate rendered routes with `npm run preview:check`.
- Prefer Astro-rendered HTML, responsive assets, and minimal client JavaScript; measure changes with the production build.
- Use Cloudflare Pages caching and compression defaults, and route media through the planned R2 delivery boundary.

## Acceptance check

`npm run build` and `npm run preview:check` exit zero, generated routes serve the expected accessible output, and the change adds no unnecessary client bundle.
