# Senshac Web Agent Guide

This is the future home of the Senshac Astro web application.

Until the cutover seed is started:

- Do not add production application code here.
- Do not configure Cloudflare Pages deployments.
- Do not add TinaCMS credentials or plaintext secrets.
- Treat `senshac-content` as the future editorial source repository.
- Use Warren for bounded implementation work only after the repository has a
  real application and quality gates.

## Repository role

This repository is the Astro web application, TinaCMS editorial boundary, and
Cloudflare Pages deployment target for Senshac. Keep agent guidance centered on
those concerns and on web performance.

## Bounded task guidance

For focused autonomous changes, follow the portable
[`bounded-warren-task`](.agents/skills/bounded-warren-task/SKILL.md) skill:

- **Positive phrasing** — state the desired outcome and the next action.
- **Instruction specificity** — name the objective, the files, and the gate.
- **Defense in depth** — keep credentials and production config out; verify with
  the repository checks.
- **Gentle coding** — make the smallest change and preserve adjacent behavior.
- **Direct execution** — inspect the smallest relevant surface, then act.
- **Token economy** — read narrowly, keep edits bounded, summarize results.

## Repository-local Seeds queue

Warren reads and executes the repository-local `.seeds/` queue. Keep active
follow-up work in Seeds, inspect the queue before implementation, and preserve
its tracked JSONL records with the repository changes.
