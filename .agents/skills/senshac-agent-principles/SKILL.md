# Senshac Agent Principles

Use these rules for every bounded change in this repository:

- **Direct execution:** inspect the smallest relevant surface, then take the next concrete action; avoid speculative refactors.
- **Instruction specificity:** name the objective, files, constraints, command, and acceptance check before editing.
- **Positive phrasing:** state the desired outcome and next action rather than a list of prohibitions.
- **Defense in depth:** keep credentials, deployment activation, and production configuration out; confirm boundaries with repository checks and review the diff.
- **Gentle coding:** make the smallest compatible edit and preserve adjacent behavior, tracker state, and existing gates.
- **Token economy:** read narrowly, keep documentation concise, reuse existing commands, and summarize only evidence that matters.

Acceptance: the requested files are the only product changes, the relevant gate is green, and `git diff --check` is clean.
