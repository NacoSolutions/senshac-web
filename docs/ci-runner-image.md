# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The verified producer handoff is successful workflow run
[36323875728](https://github.com/NacoSolutions/senshac-runner/actions/runs/36323875728),
which exports the image reference as the `image_digest` job output and as the
`senshac-runner-image-digest/runner-image-digest.txt` artifact.

The web contract actively consumes that immutable reference:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:ee7d648ca019f01cca3ddafccf8cef0ac525aa5948f7cbd8ecfa04590dcf4fb6
```

The job grants `packages: read` and authenticates the private GHCR pull with
`GITHUB_TOKEN`. GitHub starts the job as the image's non-root UID/GID 1000;
the image provides Bun and Chromium directly on `PATH`, so the workflow no
longer installs a host toolchain or downloads a browser. Before the browser
smoke suite, CI verifies Chromium and exports `command -v chromium` as
`PLAYWRIGHT_CHROMIUM_PATH` for Playwright's explicit executable path.

Keep this digest synchronized with the producer handoff artifact. Never
replace it with `latest`, a `sha-<commit>` tag, or an unverified digest.
