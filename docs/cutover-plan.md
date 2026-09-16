# Web cutover plan

`NacoSolutions/senshac-web` is a placeholder for the future focused web
repository. The archived `NacoSolutions/senshac` repository remains the
historical source until cutover work is explicitly approved.

## Planned transfer

1. Copy the Astro application and its tests from the archived source.
2. Configure TinaCMS to use the sibling `senshac-content` repository.
3. Recreate GitHub quality gates and branch protection.
4. Connect Cloudflare Pages only after build and preview smoke checks pass.
5. Verify R2/media, SEO, accessibility, and production deployment behavior.
6. Freeze the old deployment source only after the new Pages deployment is
   active and verified.

No production secrets, generated credentials, or deployment configuration belong
in this placeholder repository yet.
