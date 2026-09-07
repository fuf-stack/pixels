# Repository instructions

Pixels is a pnpm monorepo of independently released TypeScript packages. Keep
changes focused and read the nearest `AGENTS.md` before editing a package.

## Architecture

- Foundations: `pixel-utils`, `pixel-motion`, and the independent validation
  package `veto` must not depend on other published workspace packages.
- Components: `pixels` may depend on `pixel-utils` and `pixel-motion`.
- Form components: `uniform` may depend on the foundations and `pixels`.
- Applications: `atelier` may depend on `pixels` and `pixel-utils`;
  `megapixels` may depend on any published workspace package.
- `packages/config/*` are private build tooling. Published runtime packages
  must not expose or depend on `@repo/*` packages at runtime.

Changing this direction is an architecture change. Explain it in the pull
request and update `scripts/check-dependency-boundaries.mjs` in the same change.

## Public API and releases

- Treat every `package.json#exports` entry and every exported TypeScript type as
  public. Do not import another package through its `src` or `dist` directory.
- Preserve runtime behavior, export paths, types, and peer dependency ranges
  unless a breaking release and migration are explicitly intended.
- Use conventional commits with the affected package scope. Release Please owns
  versions and changelogs; do not hand-edit them for normal changes.
- Cross-package changes must update and test the lowest-level package first,
  then every consumer. Avoid convenience re-exports that reverse dependency
  direction.

## Verification and generated files

- Install with `pnpm install --frozen-lockfile`; run `pnpm check` before review.
  Install Chromium once with `pnpm exec playwright install chromium` when local
  Storybook tests require it.
- Use filtered tests while iterating, then run the full check. Never weaken a
  test, lint rule, or package check merely to make a change pass.
- `dist/`, coverage, Storybook output, and TypeScript build info are generated
  and must not be committed. Veto owns `src/__generated__/zodTypes.ts`; regenerate
  it with `pnpm --filter @fuf-stack/veto build:zod` and commit genuine changes.
- A source change that affects usage, styling, compatibility, or migration must
  update the relevant README or `docs/` page. Component behavior needs tests and
  a story; visual changes need before/after evidence and an accessibility check.

Release details are in `docs/package-release-workflow.md`; focused agent
workflows are in `docs/agent-workflows.md`.
