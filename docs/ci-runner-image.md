# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The latest producer handoff from successful workflow run
[36306866823](https://github.com/NacoSolutions/senshac-runner/actions/runs/36306866823)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:ee7d648ca019f01cca3ddafccf8cef0ac525aa5948f7cbd8ecfa04590dcf4fb6
```

This records the latest published runner digest and its producer provenance;
it does not make that runner the active image for web CI. The current web
checkout uses `devenv.nix` rather than the producer's `.flox` project lock, so
the runner entrypoint cannot activate Bun or Chromium for this checkout. The
web workflow intentionally uses hosted Ubuntu, pins Bun through
`oven-sh/setup-bun`, installs dependencies from the committed `bun.lock`, and
provisions Playwright Chromium before running the browser smoke suite. Keep
that workflow behavior unchanged unless the runner is separately verified
against the web checkout.
