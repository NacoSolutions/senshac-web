# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The producer handoff from successful workflow run [35397460307](https://github.com/NacoSolutions/senshac-runner/actions/runs/35397460307)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact.

The producer publishes immutable digests, but the current web checkout is a
`devenv.nix` consumer and no longer carries the `.flox` project lock required
by the runner entrypoint. The previously pinned digest therefore cannot be a
valid consumer image for this branch: it cannot activate Bun or Chromium for
this checkout. Do not paper over that producer/consumer mismatch by relying on
an inherited `PATH`.

The web workflow intentionally uses the hosted Ubuntu toolchain instead. It
pins Bun through `oven-sh/setup-bun`, installs dependencies from the committed
`bun.lock`, and provisions Playwright Chromium with `bunx playwright install
--with-deps chromium` before running the browser smoke suite. This keeps the
required browser coverage enabled while the runner producer and web devenv
contracts are separate. A future container migration must consume the exact
`@sha256:` output of a successful producer publication and verify Bun and
Chromium against the web checkout before replacing this setup; never use
`latest` or a `sha-<commit>` tag.
