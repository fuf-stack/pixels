# Uniform helpers

Shared non-React logic lives here, grouped by responsibility with colocated tests.
Keep component-specific logic beside its owner. Only add a helper to `index.ts`
when it is intentionally part of the public API.

## Field props

[`fieldProps/fieldProps.ts`](./fieldProps/fieldProps.ts) contains private helpers
that derive element attributes from field data:

- `getFieldControlProps(field)` creates the editable control or selection group's
  ID and ARIA associations
- `getFieldDataAttributes(field)` creates styling flags for disabled, invalid and
  required state

Call them in the renderer where the attributes are applied. They accept only the
field metadata they need, do not register fields and do not read form context.

```tsx
const controlProps = getFieldControlProps(field);
const dataAttributes = getFieldDataAttributes(field);

return (
  <div {...dataAttributes}>
    <input {...controlProps} />
  </div>
);
```

The example shows attribute placement only. Value, events and refs are connected
by the renderer. Composite engines may place associations on a group or handle
some associations themselves. Do not spread the same props indiscriminately onto
both the group and its input. Labels and messages receive their IDs through
`FieldLayout` or the respective partials.

## Other helpers

- `createOptionValueConverter` restores an option's original value type
- `flattenFieldErrors` collects messages from nested validation errors
- `nullishFields` handles Uniform's serialized empty values

See [field composition](../../../../docs/uniform/field-composition.md),
[code style](../../../../docs/code-style.md) and
[styling](../../../../docs/styling.md) for ownership and usage conventions.
