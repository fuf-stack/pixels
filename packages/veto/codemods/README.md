# Veto Codemods

This directory contains codemods to help migrate veto code between versions.

## Available Codemods

### `zod-v4.js`

Migrates code from veto (Zod v3) to veto (Zod v4).

#### Prerequisites

Install jscodeshift:

```bash
npm install -g jscodeshift
# or
pnpm add -g jscodeshift
```

#### Usage

Run the codemod on your source files:

```bash
# For JavaScript files
npx jscodeshift -t node_modules/@fuf-stack/veto/codemods/zod-v4.js src/

# For TypeScript files
npx jscodeshift -t node_modules/@fuf-stack/veto/codemods/zod-v4.js --parser=tsx src/

# Dry run (preview changes without applying)
npx jscodeshift -t node_modules/@fuf-stack/veto/codemods/zod-v4.js --dry --print src/
```

#### Transformations

| Before                         | After                               | Description                                |
| ------------------------------ | ----------------------------------- | ------------------------------------------ |
| `z.record(valueSchema)`        | `z.record(z.string(), valueSchema)` | Add key type to records                    |
| `record(valueSchema)`          | `record(string(), valueSchema)`     | Add key type (imported functions)          |
| `error.type`                   | `error.origin`                      | Rename error property in validation errors |
| `error.received`               | `error.input`                       | Rename error property                      |
| `schema.anyOf` (in conditions) | `(schema.anyOf \|\| schema.oneOf)`  | Handle both union formats                  |
| `SzType`                       | `JSONSchema`                        | Rename type import                         |

#### Limitations

The codemod handles common patterns but may not catch all cases:

1. **Dynamic property access**: `error['type']` won't be transformed
2. **Computed properties**: `error[propName]` won't be transformed
3. **Complex conditions**: Some `anyOf` checks in complex expressions may be missed

After running the codemod, review the changes and run your tests to verify correctness.

## Manual Steps After Running Codemod

1. **Review all changes** - The codemod uses heuristics that may not be perfect
2. **Run tests** - Verify all tests pass after migration
3. **Check refinement behavior** - In Zod v4, refinements don't run when base validation fails
4. **Update error handling** - If you check `error.input`, you may need to enable `reportInput: true`

## See Also

- [MIGRATION-ZOD-V4.md](../MIGRATION-ZOD-V4.md) - Full migration guide
- [Zod v4 Migration Guide](https://zod.dev/v4/migration)
