# Git workflow

Use a small, reviewable branch for each Senshac web change.

## Actions

- Inspect scope with `git status --short` and `git diff --name-only`.
- Review documentation/config changes with `git diff --check`.
- Commit the validated change with `git add AGENTS.md .agents/skills .warren/config.yaml && git commit -m "docs: add web role skills"`.
- Confirm delivery evidence with `git status --short` and `git log -1 --oneline`.

## Acceptance check

`git status --short` is empty, the latest commit contains only the requested guidance/configuration files, and `git diff --check` exits zero.
