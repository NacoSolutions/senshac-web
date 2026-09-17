# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The producer handoff from successful workflow run [35214744376](https://github.com/NacoSolutions/senshac-runner/actions/runs/35214744376)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact.

The web CI workflow consumes that handoff through an immutable digest:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:a6579fc8e776f5a8c94f9f3287ad8864d17706445466992d8704fa9baf46bbfe
```

Keep the `container.image` value in `.github/workflows/ci.yml` as the exact
`@sha256:` reference from a successful producer publication. Do not replace it
with `latest`, a `sha-<commit>` tag, or another mutable reference. The existing
npm quality and repository-contract gates remain unchanged.
