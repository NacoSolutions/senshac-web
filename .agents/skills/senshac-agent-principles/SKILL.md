# Senshac Agent Principles

Use these principles for bounded work in the Senshac Web repository. State the
intended outcome, make the smallest useful change, and leave evidence that the
repository remains ready for its next step.

## Principles

### Direct execution

Inspect the smallest relevant surface, edit the named guidance or configuration
files, and run the repository check that proves the requested outcome.

**Acceptance check:** `git diff --check` passes and the selected repository
validation exits zero.

### Instruction specificity

Name the objective, files, commands, and acceptance check before editing. Keep
scope limited to the requested guidance and configuration boundary.

**Acceptance check:** `git diff --name-only` lists only the named guidance or
configuration files, plus any explicitly required queue records.

### Positive phrasing

Write each instruction as an affirmative action with its desired outcome. Use
clear verbs such as preserve, inspect, verify, document, and commit.

**Acceptance check:** every new instruction states an action and an observable
result without relying on prohibition-only wording.

### Defense in depth

Keep credentials, plaintext secrets, deployment activation, and production
bindings outside guidance changes. Verify the repository's exclusion and secret
boundaries with its documented checks.

**Acceptance check:** `npm run lint` passes and the repository's relevant
exclusion check reports a green result when the task touches its scope.

### Gentle coding

Make the smallest change that satisfies the objective, preserve adjacent
behavior and existing project guidance, and retain repository-local settings.

**Acceptance check:** the diff contains no production application changes and
`.warren/config.yaml` retains `defaultProvider: openrouter` and
`defaultModel: openai/gpt-5.6-luna`.

### Token economy

Read narrowly, keep edits bounded, and summarize the changed files, validation,
and commit in the completion report.

**Acceptance check:** one bounded documentation/config validation runs after
editing, and `git status` confirms a clean committed result.

## Repository validation

For documentation or configuration-only work, run one bounded validation after
editing:

```sh
npm run lint && git diff --check
```

Use the repository's broader `npm run quality` gate when production code,
content contracts, or build behavior changes.
