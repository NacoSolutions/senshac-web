# Git Workflow

Use for any change that must land in the repository.

```bash
git status --short --branch
git diff --check
git diff -- AGENTS.md .agents/skills .warren/config.yaml
git add AGENTS.md .agents/skills .warren/config.yaml
git commit -m "docs: add repository agent skills"
git status --short --branch
git log -1 --oneline
```

Keep `.seeds/` and `.mulch/` unchanged unless explicitly requested. Do not push; Warren delivers the branch. Acceptance: the commit contains the intended documentation/config files, status is clean (apart from harness files already untracked), and the final log names the commit.
