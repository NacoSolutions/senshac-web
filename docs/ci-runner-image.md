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

The pinned runner is the runtime boundary for CI. Its image entrypoint
activates the Flox environment before job steps run, so the web workflow uses
the inherited `PATH` and invokes `bun` directly. It does not require a `flox`
binary or install Bun, Chromium, or system browser packages in the job.

The checked-in consumer manifest currently contains Bun and shared quality
tools, but not Chromium. The browser smoke step verifies that the pinned
producer image exposes `chromium` and sets `PLAYWRIGHT_CHROMIUM_PATH` to that
executable. If Chromium is missing, the step fails with an explicit producer
image contract error. Do not download a browser in this consumer workflow;
update the workflow to a newly published immutable producer digest only after
the producer includes and verifies Chromium.
