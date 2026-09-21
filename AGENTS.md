# Senshac Web Agent Guide

This is the future home of the Senshac Astro web application.

Until the cutover seed is started:

- Do not add production application code here.
- Do not configure Cloudflare Pages deployments.
- Do not add TinaCMS credentials or plaintext secrets.
- Treat `senshac-content` as the future editorial source repository.
- Use Warren for bounded implementation work only after the repository has a
  real application and quality gates.

## Autonomous agent guidance

For focused autonomous changes, follow
[`.agents/skills/bounded-warren-task/SKILL.md`](.agents/skills/bounded-warren-task/SKILL.md).

Project rules:

- Positive phrasing: state what to do and the desired outcome, and prefer a
  specific positive instruction over a vague prohibition.
- Instruction specificity: name the objective and the exact files or surface in
  scope before editing.
- Defense in depth: keep secret boundaries, preview exclusions, and quality
  gates layered rather than relying on any single check.
- Gentle coding: make the smallest change that satisfies the objective and
  preserve existing behavior and instructions.
- Direct execution: inspect, edit, validate, and commit without exploratory
  detours or unrelated trackers.
- Token economy: read the smallest relevant surface, avoid repeating a gate
  unless its result is actionable, and stop after a clean commit and bounded
  verification.

## Repository-local Seeds queue

Warren reads and executes the repository-local `.seeds/` queue. Keep active
follow-up work in Seeds, inspect the queue before implementation, and preserve
its tracked JSONL records with the repository changes.
