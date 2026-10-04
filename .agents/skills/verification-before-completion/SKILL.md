# Verification before completion

Prove that a documentation or configuration change preserves the Senshac web contract before reporting completion.

## Actions

- Run the bounded check `npm run lint && git diff --check` after editing.
- Run `npm run test` when the change affects a documented contract or validation behavior.
- Confirm `.warren/config.yaml` omits `agentImage`, `defaultProvider`, and `defaultModel`; Warren instance and agent configuration own those choices.
- Confirm `git status --short` is clean after committing and record the commit with `git log -1 --oneline`.

## Acceptance check

The selected checks exit zero, image/provider/model choices remain centrally configured, and the final status is clean with a recorded commit.
