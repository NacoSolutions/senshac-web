# Web Performance

Use when changing Astro routes, layouts, content loading, or client-side assets.

```bash
npm run build
npm run preview:check
```

Prefer static Astro output, server/build-time content, minimal JavaScript, semantic HTML, and existing assets. Avoid new network requests, runtime content adapters, large dependencies, or client hydration without measured need.

Acceptance: the build succeeds, preview checks validate `/` and the 404 contract, output remains static and accessible, and no unnecessary client or network work is added.
