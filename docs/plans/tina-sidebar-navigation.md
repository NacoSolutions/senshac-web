# TinaCMS Sidebar Collection Organization

## Goal
Make the TinaCMS sidebar easier for editors to scan by grouping page and portfolio collections with consistent labels and order, while keeping settings in the existing global-collection area.

## Non-goals
- Do not change collection names/IDs, content paths, document matching, schemas, routing, permissions, or editorial data.
- Do not add custom Tina UI or simulate unsupported nested navigation.

## Context
- Tina collections are declared in `tina/config.ts`. Installed Tina schema-tools types expose `ui.global`, but no custom nested navigation-group field.
- Current collection labels use inconsistent prefixes such as `Pages / Home`, `Legal / Pages`, and `Portfolio / Projects`.
- Tina's native global collection area is already used for site configuration and translations.

## Blast radius
Only sidebar labels and collection order change. Collection IDs, paths, matching, fields, routing, and stored content remain unchanged. Tina's generated lockfile may reflect label/order updates.

## Steps and tests
1. Add a contract test for the desired label/order and preserved global settings; run it red before changing the schema.
2. Update labels and declaration order in `tina/config.ts`; rerun the focused test.
3. Run Tina locally with the merged sibling content checkout, review the generated lockfile, and inspect the sidebar if the editor preview is available.

## Verification
- `bun test test/tina-sidebar-collections.test.mjs`
- `bun run dev:cms`; review `tina/tina-lock.json`
- `bun run quality`
- `git diff --check`

## Rollback
Revert the config-label/order change and generated Tina lockfile; no content migration is required.

## Open questions
None. Tina collections remain flat; grouping uses consistent category labels/order plus its built-in global area.

### For Executor
Read order: this plan, `tina/config.ts`, `test/tina-sidebar-collections.test.mjs`, Tina collection type definitions.
Assumed working state: clean branch from current `origin/main`.
Owned files: `tina/config.ts`, `tina/tina-lock.json`, `test/tina-sidebar-collections.test.mjs`, this plan.
Verification commands: the four commands listed above.
