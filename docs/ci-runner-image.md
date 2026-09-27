# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The producer handoff from successful workflow run [36306866823](https://github.com/NacoSolutions/senshac-runner/actions/runs/36306866823)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact.

The web CI workflow consumes that handoff through an immutable digest:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:ee7d648ca019f01cca3ddafccf8cef0ac525aa5948f7cbd8ecfa04590dcf4fb6
```

Keep the `container.image` value in `.github/workflows/ci.yml` as the exact
`@sha256:` reference from a successful producer publication. Do not replace it
with `latest`, a `sha-<commit>` tag, or another mutable reference. The existing
npm quality and repository-contract gates remain unchanged.
