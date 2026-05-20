# Package Release Workflow

This repository uses [Release Please](https://github.com/googleapis/release-please) to open and maintain release PRs, and uses `lerna publish from-package` in CI to publish packages to npm.

## Release Please setup

The workflow lives in `.github/workflows/release-please.yml` and runs on pushes to:

- `main`
- `next` (prerelease branch)

The `release-please` job uses:

- `googleapis/release-please-action@v5`
- `target-branch: ${{ github.ref_name }}`
- branch-specific config and manifest selection

Config files:

- `release-please-config.json` for `main`
- `release-please-config-next.json` for `next`

Manifest files:

- `.release-please-manifest.json` for `main`
- `.release-please-manifest-next.json` for `next`

Both config files use the Node workspace plugin and track packages under `packages/*`.

## End-to-end flow

1. A push to `main` or `next` triggers Release Please.
2. Release Please opens/updates release PRs based on conventional commits.
3. When a release PR is merged and `releases_created == 'true'`, publish steps run.
4. CI checks out the repo, runs the shared project setup action, and publishes to npm.

If no release is created, the publish steps are skipped.

## Why we publish with Lerna

`pnpm publish` does not currently support npm trusted publishing (OIDC) in the way we need for this workflow, so release publishing is performed with Lerna (Lerna-Lite), which delegates to npm.

## Security and supply chain choices

To reduce supply chain risk in CI, publishing uses the workspace-pinned `@lerna-lite/cli` dependency via:

- `pnpm exec lerna ...`

We explicitly avoid `npx lerna ...` in release jobs, because `npx` may install packages at runtime and can execute install scripts from newly resolved artifacts.

Pinning `@lerna-lite/cli` in root `devDependencies` gives us:

- deterministic CLI versioning
- lockfile-backed dependency resolution
- no ad-hoc runtime package downloads in the publish step

## Branch behavior

- `main`: publish with default npm dist-tag (`latest`)
- `next`: publish with prerelease dist-tag (`next`)

The workflow conditionally sets `--dist-tag next` on the `next` branch.

## Permissions

The release job requires:

- `contents: write`
- `pull-requests: write`
- `id-token: write` (required for npm trusted publishing via OIDC)
