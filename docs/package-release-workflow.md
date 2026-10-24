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

Before publishing, CI runs `pnpm verify:packages` against every publishable
workspace package. The check inspects packed files and declarations, rejects
unresolved `workspace:` ranges, installs all tarballs into a clean consumer
fixture, and type-checks every public JavaScript entry point through the package
resolver.

The temporary consumer writes local tarball overrides to `pnpm-workspace.yaml`
so dependencies between workspace packages use the artifacts under test, even
when a release PR contains versions that are not published yet. Do not move
these overrides into `package.json#pnpm`: current pnpm versions ignore that
configuration.

If no release is created, the publish steps are skipped.

## Why we publish with Lerna

`pnpm publish` does not currently support npm trusted publishing (OIDC) in the way we need for this workflow, so release publishing is performed with Lerna (Lerna-Lite), which delegates to npm.

## Security and supply chain choices

To reduce supply chain risk in CI, publishing uses the workspace-pinned `@lerna-lite/cli` dependency via:

- `./node_modules/.bin/lerna ...`

We explicitly avoid `npx lerna ...` in release jobs, because `npx` may install packages at runtime and can execute install scripts from newly resolved artifacts.
We also avoid `pnpm exec lerna ...` in this workflow to prevent dependency verification from triggering install behavior before execution.

Pinning `@lerna-lite/cli` in root `devDependencies` gives us:

- deterministic CLI versioning
- lockfile-backed dependency resolution
- no ad-hoc runtime package downloads in the publish step

## Branch behavior

- `main`: publish with default npm dist-tag (`latest`)
- `next`: publish with prerelease dist-tag (`next`)

The workflow conditionally sets `--dist-tag next` on the `next` branch.

The next config must set `"versioning": "prerelease"` as well as
`"prerelease": true` and `"prerelease-type": "next"`. The strategy generates
`-next` versions; the prerelease flag alone only marks GitHub releases.

### Bootstrap or update next

Run `node scripts/bootstrap-next-branch.mjs` from a clean repository root with
Git and Node.js installed. It fetches origin, creates or resumes next (including a
remote-only branch), and merges origin/main. Resolve any merge conflicts before
rerunning it. It does not require checking out main, so main can remain open in
another worktree.

After merging next into main and completing the stable release, start a fresh
cycle explicitly:

```bash
node scripts/bootstrap-next-branch.mjs --start-new-cycle
```

The Makefile shortcut is `make bootstrap-next ARGS=--start-new-cycle`.

This mode merges current origin/main, resets `bootstrap-sha` to that main commit,
and initializes every package at the next major stable version with `-next.0`.
For example, stable `2.0.0` starts at `3.0.0-next.0`. It discards existing
prerelease counters, including packages whose prerelease base is still ahead of
stable. Use it only when starting a new cycle. Ordinary runs preserve the active
cutoff and counters; rerunning either mode with unchanged state creates no commit.

The script seeds missing packages at the next major version with `-next.0`.
It preserves an existing `-next` version and its counter while its base version
is ahead of stable. When stable catches up, it starts the next major cycle for
that package. Release Please generates the actual release versions and
changelogs; for a package with its own releasable commits, a `2.0.0-next.0`
baseline produces `2.0.0-next.1`. The workspace plugin can also release
consumers solely because a dependency changed. Those releases use the consumer's
package.json version as their baseline, for example `1.14.1` becomes
`1.14.2-next`; they still use the prerelease strategy and npm's next tag.

The first bootstrap records `bootstrap-sha` to exclude earlier history.
Release Please ignores this cutoff after the first release and then uses the
latest release. Legacy `last-release-sha` settings are migrated without changing
their original cutoff. Never leave `last-release-sha` set permanently: it
overrides release discovery and can repeatedly include already released commits.

Review the resulting commits and push with `git push -u origin next`.
Bootstrapping does not push or publish. Run `pnpm test:release` to exercise the
bootstrap against temporary Git repositories, including repeat runs, remote
branch recovery, stable version advancement, legacy cutoff migration, and new
cycles that exclude already released history.

## Permissions

The release job requires:

- `contents: write`
- `pull-requests: write`
- `id-token: write` (required for npm trusted publishing via OIDC)

Publishing sets npm provenance explicitly. The npm trusted-publisher settings
must restrict each package to this repository and `.github/workflows/release-please.yml`;
see `github-repository-settings.md` for the administrator checklist.
