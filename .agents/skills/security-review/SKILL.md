# Security Review

Use before merging changes that touch content, configuration, CI, Tina, or deployment boundaries.

```bash
npm run repository:check
git diff --check
find . -type f \( -name '.env' -o -name '*.pem' -o -name '*.key' \) -not -path './.git/*'
grep -RniE 'TINA_TOKEN|CLIENT_ID|api[_-]?key|password|secret' --exclude-dir=.git --exclude-dir=node_modules .
```

Keep credentials in environment/secret stores, never source or config. Preserve the preview-only `https://preview.invalid` site, immutable image/config pins, read-only content boundary, and exclusions for Pages/R2/DNS/Tina credentials.

Acceptance: `repository:check` is green, no secret-like files or plaintext credentials are introduced, and the diff contains no production activation.
