# Verification before completion

Prove that a documentation or configuration change preserves the Senshac web contract before reporting completion.

## Actions

- Run the bounded check `npm run lint && git diff --check` after editing.
- Run `npm run test` when the change affects a documented contract or validation behavior.
- Confirm `.warren/config.yaml` retains `defaultProvider: openrouter` and `defaultModel: openai/gpt-5.6-luna`.
- Confirm `git status --short` is clean after committing and record the commit with `git log -1 --oneline`.

## Acceptance check

The selected checks exit zero, the provider/model settings match the contract, and the final status is clean with a recorded commit.
