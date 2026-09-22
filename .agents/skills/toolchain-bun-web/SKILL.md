---
name: toolchain-bun-web
description: Apply the Senshac Bun and web-tooling contract across web repositories.
---

# Bun and web toolchain

- Use Bun with the repository lockfile: `bun install --frozen-lockfile`.
- Use the repository scripts for checks and builds; the common Pages build is
  `bun install --frozen-lockfile && bun run build`.
- Astro owns page/runtime composition; Tina owns editorial schema and content
  editing; Cloudflare/Wrangler owns deployment configuration and bindings.
- HTMX and Alpine provide progressive interactions; UnoCSS owns utility/style
  generation. Preserve existing boundaries and verify generated output after
  changing any integration.
- Keep Tina versions aligned, run the real Tina dev command after schema
  changes, review `tina/tina-lock.json`, and run the repository quality gate.

Acceptance: frozen Bun install, focused quality/build gate, reviewed generated
files, and no plaintext credentials.
