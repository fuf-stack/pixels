# Uniform hooks

Shared React logic for form binding, validation and value updates lives here.
Keep DOM interactions in the owning control and pure attribute derivation in
[helpers](../helpers/README.md). Each hook owns its types and colocated tests.

## Field binding

- `useUniformField` binds one field and returns its value, callbacks, validation
  and label metadata as `field`, alongside form operations
- `useUniformFieldArray` adds row operations, initialization and reset handling
  for array fields, including bound row `items`, `appendItem` and `moveItem`

Both are private implementations. Controls receive the field bundle without
registering the field again:

```tsx
const { field } = useUniformField({ ...uniformFieldProps, name });

return <RadioBoxesControl field={field} options={options} />;
```

The binding owns transforms and form-update timing. Controls own presentation,
focus and engine-specific interactions. They derive element attributes with the
[field props helpers](../helpers/fieldProps/fieldProps.ts) where needed.

## Supporting hooks

- `useClientValidation` manages client-side validation rules
- `useController` connects a field to React Hook Form with Uniform value handling
- `useFormContext` exposes form operations and validation-aware field state
- `useInputValueDebounce` updates the display immediately and debounces form writes,
  flushing on blur and cancelling pending edits when cleared
- `useInputValueTransform` converts between display and stored values
- `useWatchFormReset` subscribes to form resets
- `useWatchUserChange` subscribes to user-triggered value changes

These hooks have public subpath exports. Consumers import from
`@fuf-stack/uniform/hooks/<hook>`; the authoritative public API is defined in
[package.json](../../package.json).

See [field composition](../../../../docs/uniform/field-composition.md) for the
field contract and [code style](../../../../docs/code-style.md) for ownership and
readability conventions.

Sensitive fields register diagnostic redaction through the private binding.
See [Uniform compared with React Hook Form](../../../../docs/uniform-vs-rhf.md).
