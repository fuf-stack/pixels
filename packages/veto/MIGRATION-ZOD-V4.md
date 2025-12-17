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

> 📖 **Documentation:** This behavior is documented in the
> [Zod v4 Refinements docs](https://zod.dev/api#refinements) under the `when` parameter:
> _"By default, refinements don't run if any non-continuable issues have already been encountered.
> Zod is careful to ensure the type signature of the value is correct before passing it into any refinement functions."_

In Zod v4, `superRefine` callbacks don't execute when the base schema validation fails. This means:

- If you have both type errors and refinement errors, only type errors will appear
- Custom refinements (like `unique` in arrays) won't run if element validation fails
- Array `.min()` constraints must pass before `superRefine` runs

**Example:**

```typescript
const schema = refineArray(array(object({ name: string().min(5) })).min(3))({
  unique: { mapFn: (val) => val?.name },
});

// The unique refinement will NOT run if:
// 1. Any 'name' field fails validation (e.g., too short), OR
// 2. The array has fewer than 3 elements

// All base validations must pass first, then superRefine executes
```

**Workaround:** Ensure all base validations pass before expecting refinement errors. In tests, this may require providing valid data for all fields to trigger refinement checks.

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

## Future Optimization Opportunities

After the Zod v4 migration is complete, the following areas of veto could potentially be optimized or simplified:

### 1. Error Formatting (`veto.ts`)

**Current state:** Veto has ~150 lines of custom error formatting logic (`formatError`, `transformErrorValue`, `setNestedValue`, etc.)

**Zod v4 provides:**

- `z.treeifyError()` - Nested error structure
- `z.flattenError()` - Flat field → errors mapping
- `z.prettifyError()` - Human-readable string

**Consideration:** These only return message strings, not full issue objects. Veto's format includes `code`, `received`, `expected`, `values`, etc. If consumers only use `message`, could simplify. Otherwise, current approach is necessary.

### 2. Schema Serialization (`serialize.ts`)

**Current state:** Custom `serializeSchema()` using `z.toJSONSchema()` with manual annotation for `isOptional`/`isNullable`.

**Zod v4 provides:** Built-in `z.toJSONSchema()` with improved output.

**Consideration:** The manual `isOptional`/`isNullable` annotation is still needed because JSON Schema doesn't explicitly represent these concepts. Could potentially use Zod's metadata system instead.

### 3. Error Map (`errorMap.ts`)

**Current state:** Uses `z.config({ customError: ... })` for global error customization.

**Zod v4 provides:** Same API, already using it.

**Consideration:** Already optimized. Could potentially use Zod's built-in localization (`zod/locales`) for i18n instead of custom messages.

### 4. `refineArray` Unique Check

**Current state:** Uses `superRefine` which doesn't run when base validation fails.

**Zod v4 provides:** The `when` parameter for refinements to control when they run.

**Consideration:** Could use `when` to make unique check run even when array.min() fails:

```typescript
.refine(uniqueCheck, {
  when: (payload) => Array.isArray(payload.value),
})
```

### 5. Type Re-exports

**Current state:** `export type * from 'zod'` to re-export all Zod types.

**Zod v4 provides:** Cleaner type structure with `z.core` namespace.

**Consideration:** Could use `z.core` types for more precise exports.

### 6. String Format Validators

**Current state:** Uses `z.string().email()`, `z.string().uuid()`, etc.

**Zod v4 provides:** Top-level `z.email()`, `z.uuid()`, etc. (more tree-shakable).

**Consideration:** Could update veto's exports to use top-level formats:

```typescript
// Instead of
export const email = () => z.string().email();

// Could use
export const email = z.email;
```

### 7. Codecs for Transformations

**Current state:** Uses `.transform()` for data transformations.

**Zod v4 provides:** `z.codec()` for bidirectional transformations.

**Consideration:** If veto needs encode/decode functionality (e.g., date ↔ string), codecs would be cleaner.

### 8. `.superRefine()` vs `.check()` API

**Current state:** Uses `.superRefine()` in `refineArray` for custom validations.

**Zod v4 provides:** A new `.check()` API that's more performant but lower-level.

```typescript
// superRefine (current)
z.string().superRefine((val, ctx) => {
  if (val.length < 5) {
    ctx.addIssue({ code: 'custom', message: 'Too short' });
  }
});

// check (Zod v4) - more verbose but faster
z.string().check((val, ctx) => {
  if (val.length < 5) {
    ctx.issues.push({ code: 'custom', message: 'Too short', input: val });
  }
});
```

**Consideration:** `.check()` is faster because it doesn't wrap the callback. Could use in performance-critical paths. However, `.superRefine()` is cleaner for most use cases.

### 9. `message` vs `error` Parameter

**Current state:** May use `message` parameter for error customization in some places.

**Zod v4 change:** The `message` parameter is deprecated in favor of `error`:

```typescript
// Deprecated (Zod v3 style)
z.string().min(5, { message: 'Too short' });

// Recommended (Zod v4)
z.string().min(5, { error: 'Too short' });

// error can also be a function for dynamic messages
z.string().min(5, { error: (issue) => `Got ${issue.input}, need 5+ chars` });
```

**Consideration:** Should update all veto helpers and examples to use `error` instead of `message`. The `message` parameter still works but is deprecated.

### Priority Recommendations

| Optimization                  | Impact | Effort | Priority                   |
| ----------------------------- | ------ | ------ | -------------------------- |
| `message` → `error` param     | Low    | Low    | Should do (deprecated)     |
| String formats to top-level   | Low    | Low    | Nice to have               |
| `when` param for refineArray  | Medium | Medium | Consider                   |
| `.superRefine()` → `.check()` | Low    | Medium | Only for perf-critical     |
| Simplify error format         | High   | High   | Only if breaking change OK |
| Use codecs                    | Low    | Medium | Only if needed             |
| i18n with zod/locales         | Medium | Medium | Consider for future        |

## Resources

- [Zod v4 Migration Guide](https://zod.dev/v4/migration)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [Error Customization in Zod v4](https://zod.dev/error-customization)
