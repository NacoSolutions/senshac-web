# Dependency Hygiene

Use when changing dependencies, lockfiles, build tooling, or package scripts.

```bash
npm ci
npm run lint
npm test
npm run typecheck
npm run build
```

Prefer the existing pinned versions and committed lockfiles (`package-lock.json` and `bun.lock`). Do not add packages for documentation-only work. If Tina schema/config changes, regenerate the tracked lock with `tinacms dev --no-server --noWatch` and inspect generated-file boundaries.

Acceptance: dependency manifests and lockfiles agree, no transient generated artifacts are committed, and `npm run quality` passes.
