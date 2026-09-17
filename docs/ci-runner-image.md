# CI runner image handoff

`senshac-runner` is the producer of the CI container; `senshac-web` is the
consumer. The producer handoff introduced by [PR #21](https://github.com/NacoSolutions/senshac-runner/pull/21)
exports the verified full image reference as the `image_digest` job output and
as the `senshac-runner-image-digest/runner-image-digest.txt` artifact.

The web CI workflow consumes that handoff through an immutable digest:

```text
ghcr.io/nacosolutions/senshac-runner@sha256:5f44b7bf1747f12ff3db2397c276f1015b41878b2283b536ee15830f453a3fec
```

Keep the `container.image` value in `.github/workflows/ci.yml` as the exact
`@sha256:` reference from a successful producer publication. Do not replace it
with `latest`, a `sha-<commit>` tag, or another mutable reference. The existing
npm quality and repository-contract gates remain unchanged.
