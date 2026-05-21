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
reference local `.pnpm/zod@.../...` paths).

veto provides `schemaFactory` to keep exported factory signatures portable
while preserving strong inferred output types.

#### How it works

`schemaFactory` returns a `VSchemaFactory<Output>` whose phantom metadata
carries the inferred OUTPUT type (a plain TS shape) — not the Zod schema
type. Plain TS shapes contain no Zod internals, so TypeScript never has to
name `.pnpm/zod@.../ZodString` etc. when printing the factory's inferred
symbol type. That avoids `TS2742`/`TS2883`.

#### Basic usage

```ts
import type { vInfer } from '@fuf-stack/veto';

import { object, schemaFactory, string } from '@fuf-stack/veto';

export const userInput = schemaFactory(
  object({
    name: string(),
  }),
);

export type UserInput = vInfer<typeof userInput>;
```

#### Parameterized factories

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

#### Important: inline the schema

Intermediate exported helpers can themselves trigger `TS2742`/`TS2883`
even when a portable `schemaFactory` is used downstream:

```ts
// PROBLEMATIC — `userInputSchema` is itself an exported inferred Zod type.
// It can trigger TS2742/TS2883 on its own, independent of the factory.
export const userInputSchema = object({
  name: string(),
});

export const userInput = schemaFactory(userInputSchema);
```

Inline the schema into the `schemaFactory(...)` call to avoid exporting
intermediate Zod-typed symbols:

```ts
// PORTABLE — no intermediate exported schema.
export const userInput = schemaFactory(
  object({
    name: string(),
  }),
);
```

The same applies to shared raw shape fragments. If you export a raw shape
object whose values are Zod schemas, that exported value also leaks
`ZodString`/`ZodOptional`/... and triggers `TS2742`/`TS2883`. Either inline
the fragment, or move it behind its own portable factory.

#### Backward-compatibility note (post-v1.1)

In versions before this guidance was added, `schemaFactory` carried the
SCHEMA type as phantom metadata under a `__vetoSchema` key. That design did
not actually fix portability — it only postponed the error. The current
metadata key is `__vetoOutput` and stores the OUTPUT type. Direct access to
either key is internal API and is not part of the supported surface; if you
were relying on `__vetoSchema` in custom helpers, switch to `__vetoOutput`
or use `vInferFactory<typeof factory>` instead.

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
- If declaration emit reports `TS2742`/`TS2883`:
  - wrap exported schema builders with `schemaFactory(...)`;
  - inline the schema into the `schemaFactory(...)` call — do not export a
    named intermediate `object({...})` const, and do not export raw shape
    fragments whose values are Zod schemas;
  - infer downstream types with `vInfer<typeof factory>` or
    `vInferFactory<typeof factory>`;
  - if you previously read the internal `__vetoSchema` phantom field,
    switch to `__vetoOutput` or use `vInferFactory`.
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
