# tsdown bundling notes

This document explains how bundling works for packages in this repo that use `tsdown`.

## Current setup

The shared `tsdown` config in `packages/config/tsdown-config/config.ts` enables:

- `bundle` behavior via tsdown defaults
- `format: ['esm']` ESM-only runtime output
- `dts: true`
- `exports: true`

With `exports: true`, tsdown updates `package.json` export-related fields after build.

## What `inlinedDependencies` means

Recent `tsdown` versions can add an `inlinedDependencies` field to `package.json`.

Example:

```json
"inlinedDependencies": {
  "tailwind-merge": "3.6.0",
  "tailwind-variants": "3.2.2"
}
```

This field is metadata produced by tsdown that lists dependencies that were bundled (inlined) into output chunks.

Important:

- `npm`/`pnpm` do not use this field for install or resolution.
- It is build metadata for tooling/visibility (what was bundled vs externalized).

## Why this matters here

If different versions of the same type-heavy dependency are present in the workspace (for example `tailwind-variants`), TypeScript declaration emit can become fragile when inferred exported types reference those libraries.

To reduce this risk, keep versions aligned across the workspace (for example using `pnpm-workspace.yaml` `overrides` for critical shared deps).

## How to control this behavior

If you want to stop tsdown from writing `inlinedDependencies`, configure package exports explicitly instead of plain `exports: true`.

See tsdown docs:

- https://tsdown.dev/options/package-exports

In particular, use the `exports` option object and set `inlinedDependencies` according to your preference.

## See also

- [pnpm overrides guide](./pnpm-overrides.md)
