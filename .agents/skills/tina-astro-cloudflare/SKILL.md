# Tina, Astro, and Cloudflare Boundary

Use when working near Tina schemas/content, Astro build configuration, or future Cloudflare deployment concerns.

```bash
npm run build
npm run preview:check
npm run repository:check
```

Keep editorial content in sibling `senshac-content`; use the committed read-only export/fixture contracts. After a Tina schema change, run `tinacms dev --no-server --noWatch` and review `tina/tina-lock.json`. Keep Pages, R2, DNS, credentials, and production deployment configuration out of this preview repository unless an approved cutover gate explicitly changes scope.

Acceptance: the Astro build and deterministic preview/repository checks pass, schema lock state matches the schema when applicable, and no secret, network write, or production deployment behavior is introduced.
