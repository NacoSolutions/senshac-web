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
with `latest`, a `sha-<commit>` tag, or another mutable reference. The existing
npm quality and repository-contract gates remain unchanged.
