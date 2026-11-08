# Senshac Web Agent Guide

This is the future home of the Senshac Astro web application.

Until the cutover seed is started:

- Keep production application code out of this repository.
- Keep Cloudflare Pages deployment configuration outside this repository.
- Keep TinaCMS credentials and plaintext secrets outside this repository.
- Treat `senshac-content` as the future editorial source repository.
- Use Warren for bounded implementation work after the repository has a real
  application and quality gates.

## Repository role

This repository is the Astro web application, TinaCMS editorial boundary, and
Cloudflare Pages deployment target for Senshac. Keep agent guidance centered on
those concerns and on web performance.

## Bounded task guidance

For focused autonomous changes, follow the portable
[`bounded-warren-task`](.agents/skills/bounded-warren-task/SKILL.md) skill and
apply the shared
[`senshac-agent-principles`](.agents/skills/senshac-agent-principles/SKILL.md)
guide:

- **Positive phrasing** — state the desired outcome and the next action.
- **Instruction specificity** — name the objective, the files, and the gate.
- **Defense in depth** — keep credentials and production config out; verify with
  the repository checks.
- **Gentle coding** — make the smallest change and preserve adjacent behavior.
- **Direct execution** — inspect the smallest relevant surface, then act.
- **Token economy** — read narrowly, keep edits bounded, summarize results.

## Curated web role skills

Use these focused guides for the corresponding Senshac web responsibility:

- [`git-workflow`](.agents/skills/git-workflow/SKILL.md) — inspect, validate, commit, and confirm clean Git delivery.
- [`terrarium-triage`](.agents/skills/terrarium-triage/SKILL.md) — select an owned, unblocked Seed from the canonical Senshac graph before implementation.
- [`dependency-hygiene`](.agents/skills/dependency-hygiene/SKILL.md) — keep Astro, TinaCMS, and Cloudflare tooling reproducible.
- [`security-review`](.agents/skills/security-review/SKILL.md) — review Tina credentials and Cloudflare deployment boundaries.
- [`verification-before-completion`](.agents/skills/verification-before-completion/SKILL.md) — run bounded checks and capture completion evidence.
- [`web-performance`](.agents/skills/web-performance/SKILL.md) — measure Astro output and protect Pages delivery performance.
- [`tina-astro-cloudflare`](.agents/skills/tina-astro-cloudflare/SKILL.md) — coordinate Tina editing, Astro builds, and Cloudflare Pages releases.
- [`toolchain-bun-web`](.agents/skills/toolchain-bun-web/SKILL.md) — use the repository's Bun, Astro, Tina, and Cloudflare toolchain safely.

## Playwright browser in Nix workspaces

When Playwright cannot launch its cached browser (for example, `spawn .../chrome-headless-shell ... ENOENT`), use the Nix-provided headless shell instead of reinstalling system packages. Locate it with:

```bash
find /nix/store -maxdepth 3 -type f -name chrome-headless-shell 2>/dev/null | head
```

Set `PLAYWRIGHT_CHROMIUM_PATH` to that executable for `bunx playwright test`; `playwright.config.ts` honors this variable. E2E tests build and serve Pages output with Wrangler by default. Use `bun run dev:cms` only when Tina/Astro editorial preview is needed.


## Local workerd in Nix workspaces

When Wrangler or Astro fails to spawn the project-installed `workerd` with `ENOENT`, the ELF binary may require a dynamic loader absent at `/lib64/ld-linux-x86-64.so.2`. A prior local workaround used a wrapper that invokes the binary through the Nix glibc loader and set `MINIFLARE_WORKERD_PATH` to the wrapper. Resolve the active loader and project binary at runtime; do not copy a wrapper with another worktree's absolute paths. Example:

```bash
loader=$(find /nix/store -maxdepth 3 -path '*/lib64/ld-linux-x86-64.so.2' -type f -print -quit)
workerd="$PWD/node_modules/@cloudflare/workerd-linux-64/bin/workerd"
cat >/tmp/senshac-workerd <<EOF
#!/usr/bin/env bash
exec "$loader" "$workerd" "$@"
EOF
chmod +x /tmp/senshac-workerd
MINIFLARE_WORKERD_PATH=/tmp/senshac-workerd bun run build
```

This can get past the spawn error, but does not guarantee a successful build; if Astro stalls after Vite starts, stop the attempt and report the timeout. Keep the wrapper outside the repository and never replace or modify the installed binary. For Wrangler preview, run Wrangler through Bun with the same `MINIFLARE_WORKERD_PATH`.
## Tina schema and lockfile workflow

When changing `tina/config.ts`, run the real local Tina dev command before
committing:

```bash
bun run dev:cms
```

This script starts Tina with Astro via `tinacms dev -c "astro dev"`. Use it
for local editorial preview and schema-driven editing; `bun run dev` is not a
script in this repository. Start it with the sibling `senshac-content`
checkout available, allow Tina to index and generate `tina/tina-lock.json`,
then stop the dev server and review the lockfile diff. Commit the generated
lockfile with the schema change and run `bun run quality` before opening a PR.
The lockfile is generated by `tinacms dev`; `tinacms build` alone is not a
replacement. If a schema is already verified and only a TinaCloud branch
reindex is needed, use a deliberate whitespace-only lockfile change, then use
the TinaCloud branch **Reindex** action and rerun the GitHub contract
workflow.

## Repository-local Seeds queue

Warren reads and executes the repository-local `.seeds/` queue. Keep active
follow-up work in Seeds, inspect the queue before implementation, and preserve
its tracked JSONL records with the repository changes.

## Portable rules and CLI skills

Load `.agents/rules/` for Caveman ultra, direct execution, positive phrasing,
defense in depth, gentle coding, token economy, and llm-shorthand. Load
`instruction-specificity.md` when authoring agent guidance. Use the local
`seeds-cli`, `mulch-cli`, `warren-operations`, and
`verification-before-completion` skills for tracker, expertise, Warren, and
completion work. Load role-specific skills for the implementation surface.
