# veto vs zod

This document summarizes how `@fuf-stack/veto` differs from using Zod directly.

## TL;DR

- veto is built on top of Zod.
- veto adds a stable, app-specific validation API and error contract.
- veto intentionally normalizes many Zod v4 issue shapes to veto's opinionated output style.

## What veto changes compared to plain Zod

### 1) Error output shape is normalized

Zod returns a flat `issues[]` array. veto returns a nested error object keyed by data paths.

In addition, veto normalizes several Zod v4 issue variants to its opinionated output, for example:

- `invalid_value` -> `invalid_literal` / `invalid_enum_value` (with `options` / `received`)
- `invalid_union` discriminator-missing cases -> `message: "Field is required"`
- `invalid_type` null/undefined cases -> `message: "Field is required"` + `received`

This is the main reason veto and Zod can differ for the same invalid input.

### 2) Primitive factories include opinionated defaults

veto factory helpers add project defaults beyond base Zod behavior.

Example:

- `string()` always trims.
- `string()` is non-empty by default (`min(1)` behavior).
- `string({ min: 0 })` opts out of the non-empty default.

### 3) `veto(...)` validates full payloads with a consistent wrapper result

`veto(schema).validate(input)` returns:

- `{ success: true, data, errors: null }` on success
- `{ success: false, data: null, errors }` on failure

This differs from plain `safeParse` result ergonomics and keeps a single contract across the codebase.

### 4) Raw object schemas are strict by default in `veto(...)`

When you pass a raw shape object to `veto(...)`, veto wraps it with strict object behavior (unknown keys produce errors), instead of silently allowing unknown keys.

### 5) `or(...)` supports `2+` branches and an optional unified error message

veto exposes an `or(...schemas)` helper that accepts two or more schemas.

- Without options, it behaves like a regular union (`z.union`) and keeps branch-level errors.
- With `{ error: '...' }` as the last argument, veto still checks all branches and returns one `custom` issue if none match.

Example:

- `or(literal('A'), literal('B'), number().min(10))` -> regular union behavior
- `or(literal('A'), literal('B'), number().min(10), { error: 'Value must match at least one allowed schema' })` -> single custom issue

### 6) `and(...)` supports `2+` schema intersections

veto exposes an `and(...schemas)` helper that accepts two or more schemas.

- It applies intersection semantics across all provided branches.
- Typing is preserved as the intersection of all branch input/output types.

Example:

- `and(objectLoose({ a: string() }), objectLoose({ b: number() }))`
- `and(objectLoose({ a: string() }), objectLoose({ b: number() }), objectLoose({ c: literal(true) }))`

### 7) `deepPartial(...)` replaces removed Zod v3 `deepPartial()` usage

Zod v4 removed the old object `deepPartial()` helper. veto exposes a
standalone `deepPartial(schema)` helper for schema-backed override configs.

It recursively optionalizes object fields while preserving the original schema
validation for values that are present. It supports objects, arrays, tuples,
records, optional/nullable wrappers, default/catch/readonly/lazy wrappers,
unions, discriminated unions, and intersections.

For discriminated unions, the discriminator remains required so Zod can still
select the correct branch. Arrays stay arrays: object elements become partial,
while scalar elements keep their scalar type (`string[]` stays `string[]`, not
`(string | undefined)[]`).

Example:

```ts
const overrides = deepPartial(
  object({
    theme: object({
      color: string(),
    }),
  }),
);

overrides.parse({ theme: {} });
```

## What veto does not change

- Core parsing semantics still come from Zod.
- You can still chain normal Zod methods on veto schemas.
- If you need exact raw Zod issue payloads, use Zod directly instead of veto-formatted errors.
