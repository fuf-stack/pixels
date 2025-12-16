# Veto Migration Guide: Zod v3 to Zod v4

This guide documents the breaking changes and migration steps for updating `@fuf-stack/veto` from Zod v3 to Zod v4.

## Overview

Veto has been updated to use Zod v4 (version 4.2.0+). This update brings performance improvements and new features but includes several breaking changes.

## Breaking Changes

### 1. `z.record()` Now Requires Both Key and Value Types

**Zod v3:**

```typescript
z.record(z.string()); // Key type was implicitly z.string()
```

**Zod v4:**

```typescript
z.record(z.string(), z.string()); // Both key and value types are required
```

### 2. Error Issues No Longer Include `input` by Default

For security reasons, Zod v4 no longer includes the input value in error issues by default. To opt-in:

```typescript
schema.parse(data, { reportInput: true });
```

The property name also changed from `received` to `input`.

### 3. `invalid_union_discriminator` Renamed to `invalid_union`

The issue code `invalid_union_discriminator` has been merged into `invalid_union` in Zod v4.

### 4. Refinements Don't Run When Base Validation Fails

In Zod v4, `superRefine` callbacks don't execute when the base schema validation fails. This means:

- If you have both type errors and refinement errors, only type errors will appear
- Custom refinements (like `unique` in arrays) won't run if element validation fails

**Example:**

```typescript
const schema = refineArray(array(object({ name: string() })))({
  unique: { mapFn: (val) => val?.name },
});

// If some objects have invalid 'name' fields,
// the unique refinement won't run in Zod v4
```

### 5. Error Property Changes

| Zod v3                        | Zod v4   | Notes                                 |
| ----------------------------- | -------- | ------------------------------------- |
| `received`                    | `input`  | Only present with `reportInput: true` |
| `type` (in too_small/too_big) | `origin` | Changed property name                 |

### 6. JSON Schema Format Changes

When serializing schemas to JSON Schema:

- **Discriminated unions** now use `oneOf` instead of `anyOf`
- The output follows JSON Schema draft 2020-12

### 7. Removed: `zodex` Dependency

The `zodex` library for schema serialization has been replaced with Zod v4's built-in `toJSONSchema()` method. The following exports are no longer available from veto:

- `SzType` - Use `JSONSchema` instead
- All zodex-specific types

## Migration Steps

### Step 1: Update Dependencies

```bash
pnpm update @fuf-stack/veto
```

### Step 2: Update `z.record()` Calls

Find all `z.record()` calls with only one argument and add the key type:

```typescript
// Before
z.record(z.string());

// After
z.record(z.string(), z.string());
```

### Step 3: Update Error Property References

If your code checks error properties:

```typescript
// Before
if (error.received === 'undefined') { ... }
if (error.type === 'string') { ... }

// After
if (error.input === undefined) { ... }  // Note: requires reportInput: true
if (error.origin === 'string') { ... }
```

### Step 4: Update JSON Schema Handling

If you're using schema serialization and checking for union types:

```typescript
// Before
if (schema.anyOf) { ... }

// After
if (schema.anyOf || schema.oneOf) { ... }
```

### Step 5: Review Refinement Behavior

If you rely on refinements running alongside type validation:

- Consider restructuring your validation to separate type validation from refinements
- Be aware that refinement errors won't appear if type validation fails

## New Features Available

### Global Error Customization

Zod v4 provides a cleaner API for global error customization:

```typescript
import { z } from 'zod';

z.config({
  customError: (issue) => {
    if (issue.code === 'invalid_type' && issue.received === 'undefined') {
      return 'Field is required';
    }
    return undefined; // Use default message
  },
});
```

### Built-in JSON Schema Generation

```typescript
const schema = z.object({ name: z.string() });
const jsonSchema = schema.toJSONSchema();
// Or using global function:
const jsonSchema = z.toJSONSchema(schema);
```

### Internationalization Support

Zod v4 includes built-in localization:

```typescript
import { z } from 'zod';
import { fr } from 'zod/locales';

z.config(fr());
```

## Codemod

A codemod is available to automate many of these changes:

```bash
npx jscodeshift -t @fuf-stack/veto/codemods/zod-v4.js src/
```

The codemod handles:

- `z.record()` single-argument calls
- Error property renames (`type` → `origin`, `received` → `input`)
- `anyOf` → `anyOf || oneOf` checks

## Resources

- [Zod v4 Migration Guide](https://zod.dev/v4/migration)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [Error Customization in Zod v4](https://zod.dev/error-customization)
