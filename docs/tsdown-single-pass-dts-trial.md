# Future Trial: Single-Pass DTS Dependency Inlining

## Why this note exists

Today we use a two-pass `tsdown` strategy in some packages to keep runtime dependencies external while still producing portable declaration files.

This is intentionally more complex, but currently the most reliable approach for our edge cases.

There is upstream work/discussion around DTS-specific dependency inlining that may allow us to simplify this in the future:

- [rolldown-plugin-dts issue #199](https://github.com/sxzz/rolldown-plugin-dts/issues/199)
- [tsdown commit adding `deps.dts` override](https://github.com/eryue0220/tsdown/commit/881bf0d831f9774bdc4553af891c58e0d42e3bbc)

## Current status (as of tsdown `0.22.1`)

- `deps` controls are shared behavior for JS + DTS.
- We still need separate control for "external in JS, inline in DTS" in our real packages.
- Keep the two-pass helper/config in place for now.
- The `deps.dts` work exists in a fork commit right now; adopt only after equivalent support lands in the tsdown version we actually use.

## When to retry

Retry a single-pass setup when one of these happens:

- `tsdown`/`rolldown-plugin-dts` release notes add explicit DTS-only dependency inlining controls.
- Issue #199 (or equivalent) is implemented and documented.
- We upgrade tool versions and can validate with a small spike.
- Our installed `tsdown` version includes a supported `deps.dts` option (or equivalent).

## Trial plan (small, safe spike)

1. Pick one package first (`packages/veto`).
2. Replace two-pass config with one-pass config that attempts the same JS external + DTS portability behavior.
3. Run package build and type checks.
4. Verify generated `.d.ts` has no non-portable/internal path references.
5. Verify consumer-style checks with strict TypeScript (`skipLibCheck: false`) still pass.

## Success criteria

- Same runtime bundling behavior as today.
- No DTS portability regressions (`TS2742`, `TS2883`, `TS2307` style consumer failures).
- No package-specific exceptions that reintroduce complexity equal to two-pass.

## Rollback criteria

If any core package (`veto`, `pixel-utils`, `pixel-motion`) regresses on declaration portability or introduces fragile per-package hacks, revert to two-pass and retry on a later tool release.
