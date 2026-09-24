# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The producer handoff from successful workflow run [35397460307](https://github.com/NacoSolutions/senshac-runner/actions/runs/35397460307)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact.

The web CI workflow consumes that handoff through an immutable digest:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:a950ccba03d922b18bd4f69f456fda39e3389760b539c96904b7f671d12c7055
```

Keep the `container.image` value in `.github/workflows/ci.yml` as the exact
`@sha256:` reference from a successful producer publication. Do not replace it
with `latest`, a `sha-<commit>` tag, or another mutable reference.

The pinned runner is the runtime boundary for CI. The web workflow invokes
`flox activate` for dependency installation, quality checks, and browser smoke
checks; it does not install Bun, Chromium, or system browser packages in the
job. `PLAYWRIGHT_CHROMIUM_PATH` points Playwright at the `chromium` executable
exported by that activated environment.

The checked-in consumer manifest currently contains Bun and shared quality
tools, but not Chromium. This repository does not own the `senshac-runner`
producer, so the bounded follow-up there is to add
`chromium.pkg-path = "chromium"` to the producer's `.flox/env/manifest.toml`,
rebuild and publish the image with its existing Flox/Nix build path, verify
`flox activate -- command -v chromium` in the image, and then update this
workflow to the newly published immutable digest. Until that producer handoff
is published, the browser smoke step correctly fails rather than downloading
or installing a browser in the consumer workflow.
