# Security review

Protect the Astro preview, Tina editorial boundary, and Cloudflare Pages release boundary.

## Actions

- Run the repository boundary check with `npm run repository:check`.
- Keep Tina credentials in `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` environment settings supplied by the deployment platform.
- Review tracked changes for credential-shaped values with `git diff --check` and `git grep -nE '(BEGIN .*PRIVATE KEY|api[_-]?key|token|password|secret)' -- ':!*.lock'`.
- Keep Cloudflare Pages, R2, DNS, and deployment bindings in platform configuration and use scoped release credentials.

## Acceptance check

`npm run repository:check` exits zero, the review finds no plaintext credentials, and deployment bindings remain platform-managed.
