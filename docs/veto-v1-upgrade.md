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

### TypeScript declaration emit may require portable schema factories

Some projects that export schema builders can hit TypeScript
`TS2742`/`TS2883` errors after upgrading (non-portable inferred types that
reference local `.pnpm/zod@...` paths).

veto v1 provides `schemaFactory` to keep exported factory signatures portable
while preserving strong inferred output types.

```ts
import type { vInfer } from '@fuf-stack/veto';

import { object, schemaFactory, string } from '@fuf-stack/veto';

const userInputSchema = object({
  name: string(),
});

export const userInput = schemaFactory(userInputSchema);

export type UserInput = vInfer<typeof userInput>;
```

Argumented factories are also supported:

```ts
import type { vInferFactory } from '@fuf-stack/veto';

import { object, schemaFactory, string } from '@fuf-stack/veto';

export const userInputByMode = schemaFactory((required: boolean) =>
  object({
    name: required ? string() : string().optional(),
  }),
);

export type UserInputByMode = vInferFactory<typeof userInputByMode>;
```

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

- Upgrade to veto v1 and Zod v4 in your project.
- If declaration emit reports `TS2742`/`TS2883`, wrap exported schema builders
  with `schemaFactory`.
- Run the codemod in dry-run mode and inspect warnings.
- Update schema-path logic that checks legacy zodex `type` tags:
  - `discriminatedUnion` -> `oneOf`/`anyOf`
  - `intersection` -> `allOf`
  - `record` -> `additionalProperties`
- Update tests that assert exact Zod issue messages/fields.
- Re-run validation tests that depend on enum/literal/discriminator errors.

## Notes

- This migration intentionally does not modify `uniform` or other package code.
- `checkSchemaPath` still exists, but it now traverses JSON Schema-shaped data.

## See also

- [tsdown bundling notes](./tsdown-bundling.md)
