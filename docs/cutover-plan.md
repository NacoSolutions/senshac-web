# Senshac web cutover specification

**Status:** pre-cutover planning only
**Scope:** Seeds issue `senshac-6ccd`
**Repositories:** `senshac-web` (this repository), archived `senshac`, and the
separate `senshac-content` editorial source

This document defines the smallest safe path from the placeholder repository to
the Astro site. It is a specification, not a deployment guide: no application
code, credentials, generated Tina configuration, or Cloudflare configuration
should be added until the relevant gate below is approved.

## Target ownership

| Concern | System of record | Boundary |
| --- | --- | --- |
| Web application, layouts, routes, integrations, tests, and build | Astro in `senshac-web` | The web repository owns presentation and runtime behavior; it does not become the editorial source. |
| Editorial schemas, entries, and editorial workflow | TinaCMS backed by `senshac-content` | Tina may read and write the content repository through approved, secret-backed automation. Content changes must not be hidden in application code. |
| Static site build and release promotion | Cloudflare Pages | Pages builds a reviewed commit and serves the resulting site. Deployment settings and tokens remain in the platform or CI secret store. |
| Media objects and delivery | Cloudflare R2 | R2 stores media only; the application references the approved media contract. R2 buckets, bindings, access policy, and credentials are infrastructure concerns, never committed secrets. |
| Historical production and emergency fallback | Archived `NacoSolutions/senshac` deployment | The archive remains deployable and unchanged until the new production path and rollback have been proven. |

Astro owns the rendered site and its runtime integration, but not editorial
truth or media storage. Tina owns the editorial model and authoring boundary,
not deployment. Pages owns release hosting, not content mutation. R2 owns object
storage, not page generation.

## Cutover sequence

1. **Baseline the archive.** Record the current production URL, routes, headers,
   SEO output, accessibility findings, media behavior, and the exact archived
   deployment revision. Confirm that the old deployment can be restored.
2. **Create the smallest web slice.** Copy only the approved Astro application
   and its tests into `senshac-web`; add a reproducible local/CI build and a
   minimal Tina integration that reads the agreed content fixture or source
   contract. Do not copy credentials, production bindings, or unrelated
   monorepo services.
3. **Prove a non-production preview.** Deploy the reviewed slice to a Pages
   preview. Validate routes, content rendering, Tina editing/preview behavior,
   media references, redirects/headers, SEO, accessibility, and error pages.
4. **Configure production boundaries.** Add Pages and R2 settings through
   protected platform/CI configuration. Review least-privilege access and
   verify that logs and build output contain no secrets. Keep the old origin
   available.
5. **Promote and observe.** Promote only the same reviewed revision that passed
   preview. Run the production smoke suite, monitor errors and media failures,
   and obtain explicit cutover approval before changing the public route.
6. **Retire only after stability.** Keep the archive and its deployment as the
   rollback source through the agreed observation window. Remove old routing or
   credentials only in a separately approved change.

## Acceptance gates

The cutover is accepted only when every gate is green and its evidence is
attached to the release or issue:

- **Repository safety:** no application or deployment secrets are tracked; no
  Tina, Pages, or R2 credentials appear in files, logs, or build artifacts; the
  placeholder CI contract and `git diff --check` pass.
- **Build and quality:** a clean checkout installs reproducibly, the Astro
  production build succeeds, tests and lint/type checks pass, and the exact
  release commit is identifiable.
- **Functional parity:** all approved public routes render successfully,
  navigation and redirects work, 404/error behavior is intentional, and
  representative editorial content matches the baseline.
- **Editorial workflow:** Tina schemas validate; an authorized preview can
  read and safely stage a content change in `senshac-content`; unauthorized
  access is denied; content ownership remains separate from application code.
- **Media and platform:** representative R2 media loads through the intended
  public delivery path; missing/private objects fail safely; Pages preview and
  production use the same reviewed build contract; cache and headers are
  verified.
- **SEO and accessibility:** canonical URLs, metadata, sitemap/robots policy,
  structured data where applicable, keyboard navigation, and automated plus
  manual accessibility checks meet the project baseline.
- **Operations and rollback:** deployment logs/alerts are available, the
  archive revision and owner are recorded, and a tested route switch restores
  the old deployment without data loss.

A failed gate blocks promotion. Fixes require a new reviewed revision and a
repeat of the affected checks; do not bypass a gate by editing production
configuration manually.

## Rollback path

If smoke checks fail, error rates rise, content is incorrect, or media is
unavailable after promotion:

1. Freeze further Pages promotions and record the failing release, symptoms,
   timestamps, and relevant logs without exposing secrets.
2. Restore the public route to the archived `senshac` deployment (or promote
   its last known-good release) using the pre-approved routing mechanism.
3. Verify the old site’s representative routes, editorial links, media, and
   health checks; announce the rollback to the owners.
4. Leave `senshac-content` and R2 objects unchanged unless the incident is
   separately diagnosed as a content or data issue. Do not “roll back” by
   deleting editorial or media data.
5. Open a follow-up, preserve the failing Pages artifact and evidence, and fix
   forward in preview. Re-run the relevant gates before another promotion.

The archive is not deleted or declared obsolete until rollback has been tested
and the observation window has ended.

## Smallest next implementation slice

The next bounded change is **the build-and-preview contract only**:

- establish the Astro project skeleton and one representative route in
  `senshac-web`, copied from the approved source without unrelated services;
- add a deterministic build, test, lint, and type-check command plus a minimal
  CI quality gate;
- define a Tina content adapter/schema contract against a non-secret fixture or
  mocked `senshac-content` input, without importing production credentials;
- document a Pages preview configuration as platform-owned placeholders, with
  no deployment activation or R2 binding; and
- add route, content-rendering, and secret-scan checks sufficient to prove the
  preview slice.

This slice must end with a green preview build and reviewable evidence. It must
not switch DNS, configure production Pages, create R2 bindings, migrate
content, or copy the full archived application. Those are subsequent changes
that require the acceptance gates above.
