# veto v1 codemod

This codemod helps migrate consumers of `@fuf-stack/veto` to veto v1.

## What it does

- Rewrites `SzType` type imports from `@fuf-stack/veto` to use the new `SerializedSchema` type while preserving local `SzType` usage via aliasing.
  - Example: `import type { SzType } from '@fuf-stack/veto'`
  - Becomes: `import type { SerializedSchema as SzType } from '@fuf-stack/veto'`
- Detects legacy zodex schema-tag checks and reports warnings with migration suggestions:
  - `'discriminatedUnion'`
  - `'intersection'`
  - `'record'`

## What it does not do automatically

- It does not rewrite legacy `.type === 'record' | 'intersection' | 'discriminatedUnion'` logic because these rewrites are context-dependent under JSON Schema output.
- It emits warnings instead, so you can make targeted manual updates safely.

## Usage

Dry-run (recommended first):

```bash
pnpm --filter @fuf-stack/veto exec tsx codemods/v1-upgrade/run.ts --path /path/to/consumer
```

Apply edits:

```bash
pnpm --filter @fuf-stack/veto exec tsx codemods/v1-upgrade/run.ts --path /path/to/consumer --write
```
