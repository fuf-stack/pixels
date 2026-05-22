# veto v1 upgrade guide

This guide covers migration from veto `0.x` to veto `1.x`.

## Overview

veto v1 is a breaking release with the following key changes:

- Zod dependency upgraded from v3 to v4.
- zodex dependency removed.
- `serializeSchema` now uses Zod v4 JSON Schema output (`z.toJSONSchema`).
- package build switched to `tsdown`.
- codemod added to help with common source updates.

## Breaking changes

### `serializeSchema` output changed

`serializeSchema` no longer returns zodex `SzType` trees.

- **Before (v0):** zodex-style schemas with tags such as `discriminatedUnion`, `intersection`, and `record`.
- **After (v1):** JSON Schema objects (`oneOf`/`anyOf`/`allOf`, `properties`, `items`, `additionalProperties`, ...).

This affects any custom `checkSchemaPath` callbacks or helper logic that checks legacy zodex tags.

### zodex type re-export removed

v0 re-exported zodex types from veto. v1 does not.

If your app imported `SzType` from `@fuf-stack/veto`, migrate to:

```ts
import type { SerializedSchema } from '@fuf-stack/veto';
```

### Error issue payloads are Zod v4-based

veto keeps its existing nested error shape, but issue internals now come from Zod v4.

- some issue codes differ (`invalid_literal`/`invalid_enum_value` now originate from Zod v4 `invalid_value`),
- discriminator errors now come from Zod v4 `invalid_union`,
- some fields/messages differ where Zod v4 removed legacy issue fields.

### TypeScript declaration emit and the `zod` dependency

Projects that export schema builders or compose veto schemas used to
hit TypeScript `TS2742`/`TS2883` errors after upgrading to veto 1.x
(non-portable inferred types that reference local `.pnpm/zod@.../...`
paths).

The history of this problem and how it was solved:

| Veto version      | Required `zod` in consumer `package.json`?                                         | Mechanism                                                                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.0.x` – `1.2.x` | Effectively yes (via `schemaFactory` workaround OR direct declaration)             | Phantom-typed factories blocked composition / chaining                                                                                                                                                                                                                                                   |
| `1.3.x`           | **Yes — required.** `schemaFactory` removed in favor of explicit `zod` declaration | `zod` declared as `peerDependency`, every consumer must add it                                                                                                                                                                                                                                           |
| `1.4.x` and later | **No.** Just install `@fuf-stack/veto`                                             | `zod` is a regular `dependency` of veto (pnpm installs it transitively). veto's `dist/index.d.ts` inlines zod's types via a dedicated tsdown dts-only pass with `deps.alwaysBundle: ['zod']`. The runtime JS leaves `import { z } from 'zod'` external so there is exactly one zod instance per process. |

If you are upgrading from `1.3.x` to `1.4+`, you can safely **remove**
`zod` from your consumer packages' `package.json`. Existing `zod`
declarations are harmless but redundant — and on a strict-deps pnpm
setup they risk pinning a different version than the one veto was
tested against. Prefer letting veto's transitive dependency resolve it.

See [veto monorepo usage](./veto-monorepo-usage.md) for the current
zero-configuration consumer experience, the two-pass `tsdown` build,
and why veto inlines zod's types but not its JS runtime.

## Codemod

A codemod is available in:

- `packages/veto/codemods/v1-upgrade/run.ts`

It performs:

- safe rewrite of `SzType` imports to `SerializedSchema` aliases,
- warning-only detection for legacy zodex tag checks:
  - `discriminatedUnion`
  - `intersection`
  - `record`

### Dry run

```bash
pnpm --filter @fuf-stack/veto codemod:v1 --path /path/to/project
```

### Apply changes

```bash
pnpm --filter @fuf-stack/veto codemod:v1 --path /path/to/project --write
```

## Manual migration checklist

- Upgrade to veto v1 (preferably `1.4.0` or later — see below) and Zod
  v4 in your project.
- If you upgraded from `1.0`–`1.2`, run the codemod in dry-run mode and
  inspect warnings.
- Update schema-path logic that checks legacy zodex `type` tags:
  - `discriminatedUnion` -> `oneOf`/`anyOf`
  - `intersection` -> `allOf`
  - `record` -> `additionalProperties`
- Update tests that assert exact Zod issue messages/fields.
- Re-run validation tests that depend on enum/literal/discriminator errors.
- **On veto `1.4.0`+**: remove any `zod` entry from your consumer
  packages' `package.json`. It is no longer required — zod's types are
  inlined into `dist/index.d.ts`, and zod's runtime is installed
  transitively as a dependency of veto.
- **On veto `1.3.x` only**: if declaration emit reports
  `TS2742`/`TS2883`, add `zod` (matching veto's peer pin) to the
  `package.json` of every package that imports from `@fuf-stack/veto`,
  or upgrade to `1.4.0`+ and skip this step entirely.

## Notes

- This migration intentionally does not modify `uniform` or other package code.
- `checkSchemaPath` still exists, but it now traverses JSON Schema-shaped data.

## See also

- [veto monorepo usage](./veto-monorepo-usage.md)
- [tsdown bundling notes](./tsdown-bundling.md)
