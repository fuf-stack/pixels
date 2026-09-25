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

## Dependency upgrade

Renovate and pnpm use a 14-day minimum release age for registry packages.
Both exempt `@fuf-stack/*` so freshly published internal packages can be
updated and installed immediately. pnpm strictly enforces the delay for other
direct and transitive dependencies. Keep `minimumReleaseAge` aligned in
`renovate.json5` (`14 days`) and `pnpm-workspace.yaml` (`20160` minutes).
Existing non-exempt lockfile entries that are too new remain blocked until they
mature or are replaced with compatible older versions.

Let Renovate update exact pins and the lockfile. Review release notes for API,
type, browser, and peer-range changes; inspect every workspace consumer; and do
not add an override without documenting why one version must be forced. Run
`pnpm check`, with extra package-consumer or migration tests when behavior or
published declarations can change.

When a Renovate pull request fails only because committed Vitest snapshots are
out of date, comment `/autofix-snapshots` on the pull request or add the
`autofix:snapshots` label. The snapshot autofix workflow runs the test suite in
update mode, refuses to commit non-snapshot changes, verifies the updated suite,
pushes the snapshot commit to the Renovate branch, and dispatches CI for it.

## Visual and accessibility verification

Use Storybook to cover meaningful states, themes, responsive behavior, and
reduced motion. Run `pnpm test:storybook`, then manually verify keyboard order,
focus visibility/restoration, accessible names and descriptions, disabled and
error states, and contrast. Record browsers, assistive technology, and visual
evidence in the pull request. Automated accessibility checks are a baseline,
not a replacement for interaction review.
