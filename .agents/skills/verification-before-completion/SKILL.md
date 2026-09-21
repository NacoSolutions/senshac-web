# Verification Before Completion

Use before reporting any implementation or documentation task complete.

1. Run `npm run quality` (or `$WARREN_QUALITY_GATE` when set); this repository gate covers lint, tests, type checks, build, preview, and repository exclusions.
2. Run `git diff --check`.
3. Inspect `git status --short` and `git diff --stat`; confirm no `.seeds/` or `.mulch/` state changed.
4. After committing, rerun the selected gate and `git status --short --branch`.

Acceptance: every command exits zero, no warnings are left unresolved, the requested files are committed, and the completion report includes exact commands and results.
