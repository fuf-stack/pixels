# Agent and maintainer workflows

These workflows are deliberately command-led. Read the root and nearest package
`AGENTS.md`, make the smallest coherent change, and record the commands and
manual checks in the pull request.

## Public API review

Inspect the affected `package.json#exports`, source barrel, generated
declarations, peer dependencies, and downstream workspace imports. Compare old
and new call sites and decide whether the change is internal, additive, or
breaking. Run focused tests followed by `pnpm check`. A breaking change needs a
migration document and explicit release sequencing.

## Pre-commit checks

`pnpm lint-staged` batches staged files from all seven runtime packages into
one `vitest related --run` invocation, then lints those files. Related tests exclude `@repo/storybook-config*`, matching the unit-test
CI job; Storybook browser tests run through `pnpm test:storybook`. This keeps
browser-only CSS transforms out of related unit-test discovery and avoids
scanning the workspace separately for each affected package.

## Package release

Release Please owns versions and changelogs. Review its proposed conventional
commits and package set, then run `pnpm build` and `pnpm verify:packages`.
Published output must contain only intended files, resolved dependency ranges,
working declarations, and provenance. See `package-release-workflow.md` for the
branch and trusted-publishing flow.

## Component change

Update the implementation, focused tests, and Storybook stories together. Test
semantics, keyboard and focus behavior, accessible names, controlled state, and
important loading/error/empty states. Run the package's focused Vitest command,
`pnpm test:storybook`, and then `pnpm check`. Attach before/after evidence for
visual changes.

## Storybook edge cases

Run `pnpm test:storybook` from the root to delegate to the shared Storybook
package's `test:storybook` script. That package owns the browser test command.
The CI unit-test job uses `pnpm test --project='!@repo/storybook-config*'` to
exclude browser projects; the separate Storybook job installs Chromium and runs
those tests.

Keep normal usage and variant examples in `<Component>.stories.tsx`. Put edge
cases and focused regression scenarios in a sibling
`<Component>EdgeCases.stories.tsx`, following the Slider examples. Give that file
the title `<existing component title>/Edge Cases` so Storybook groups these
scenarios under the component rather than mixing them into its regular examples.
Use short story names without repeating "Edge Case" in the sidebar.

Reuse the component's default story metadata (including decorators and args)
and append `@repo/storybook-config/edge-case-decorator` to its decorators. Each
edge-case story must set `parameters.edgeCaseDescription` to a short explanation
of the trigger and expected behavior. The shared decorator renders this in a
"What this checks" box above the example. Keep the outer layout unconstrained;
only the explanation box should have a fixed width, so form debug panels and
portals still have room.

Move scenario-only fixtures and helpers with their stories. Preserve their
`play` functions, assertions, setup, and cleanup. Update the component's snapshot
test to call `storySnapshots` for both story modules, retaining any documented
environment-specific exclusions. Browser Storybook tests discover both files
automatically. Keep export names when moving existing stories to preserve
snapshot keys; the new title changes their Storybook URLs, so update any links.

Ordinary disabled, empty, loading, and error variants can remain with the normal
examples. Separate stories that exercise unusual combinations, boundary
conditions, or a specific regression.

## Dependency upgrade

Renovate and pnpm use a 14-day minimum release age for registry packages.
Both exempt `@fuf-stack/*` so freshly published internal packages can be
updated and installed immediately. pnpm strictly enforces the delay for other
direct and transitive dependencies. Keep `minimumReleaseAge` aligned in
`renovate.json5` (`14 days`) and `pnpm-workspace.yaml` (`20160` minutes).
Existing non-exempt lockfile entries that are too new remain blocked until they
mature or are replaced with compatible older versions.

Pin external GitHub Actions to full commit SHAs, including actions used inside
local composite actions. Keep the version tag in a trailing comment so Renovate
can track updates through `helpers:pinGitHubActionDigests`. Resolve pins from
the official upstream repository; local `./` action references stay unchanged.

Let Renovate update exact pins and the lockfile. Review release notes for API,
type, browser, and peer-range changes; inspect every workspace consumer; and do
not add an override without documenting why one version must be forced. Run
`pnpm check`, with extra package-consumer or migration tests when behavior or
published declarations can change.

When a Renovate pull request fails only because committed Vitest snapshots are
out of date, comment `/autofix-snapshots` on the pull request or add the
`autofix:snapshots` label. The snapshot autofix workflow runs the test suite in
update mode on an immutable head SHA with a read-only token and no persisted Git
credentials. A separate job runs only trusted workflow code and treats the build
artifact as untrusted data. It accepts updates only to existing regular
`__snapshots__/*.snap` files containing only Vitest snapshot data assignments
(without JavaScript interpolation or extra code), verifies the branch still
points to the tested SHA,
creates a commit through the GitHub API, and dispatches CI. Inline snapshots in
test source, new snapshot files, and other changes require manual review. If the
branch moves, request a fresh run. Manual requests must dispatch the workflow
from the default branch and specify a `renovate/` branch.

The trusted artifact gate tests run automatically with `pnpm test`. For a
focused run, use `pnpm exec vitest run --project=ci-scripts`.
The workflow delegates branch resolution, test retries, artifact collection and
validated writes to `scripts/ci-snapshot-autofix.mjs`. The resolver and writer
load the trusted workflow revision; only the read-only build job loads branch code.

## SonarQube coverage

The unit-test CI command selects projects to exclude Storybook and sets
`--coverage.include='**/src/**/*.{js,jsx,ts,tsx}'`. Vitest 5 matches coverage paths
relative to the first matching project root. With both package projects and the
root-level `ci-scripts` project selected, the glob must match both `src/...` and
`packages/.../src/...`. A package-only glob can produce file records without
measured lines even when all tests pass.

CI verifies that `coverage/lcov.info` contains source records and measured
lines before uploading it and again after downloading it for SonarQube. An
empty report must fail CI rather than silently report 0% coverage.

## Renovate memory failures

Mend-hosted jobs have a 3 GiB memory limit. `renovate.json5` caps Node child
processes used for package-manager commands at 1024 MiB with
`toolSettings.nodeMaxMemory`, leaving room for Renovate and other processes.
This limits the Node heap; it does not increase the hosted job limit or cap
the total memory of every process.

If a job still fails with `kernel-out-of-memory`, inspect the end of its debug
log to identify the active operation before adjusting the cap. A Node heap
error in pnpm may require a higher cap; continued total job exhaustion may
require a higher Mend resource tier or a self-hosted runner. See the
[Mend-hosted FAQ](https://docs.renovatebot.com/mend-hosted/faq/#im-hitting-a-timeout-kernel-out-of-memory-limit-with-a-pnpmyarn-project).

## Visual and accessibility verification

Use Storybook to cover meaningful states, themes, responsive behavior, and
reduced motion. Run `pnpm test:storybook`, then manually verify keyboard order,
focus visibility/restoration, accessible names and descriptions, disabled and
error states, and contrast. Record browsers, assistive technology, and visual
evidence in the pull request. Automated accessibility checks are a baseline,
not a replacement for interaction review.
