# Shared field presentation

Field partials reuse label, help text and error markup without registering a
field or reading form state. Most are private, `FieldLabel`, `FieldHelper`,
`FieldValidationError` and `FieldCopyTestIdButton` are also exported for custom controls. Their props live beside their implementations.
Each partial has colocated stories and tests for its presentation and semantics.
Shared control associations and IDs live in `types.ts`.

- [FieldLayout](./FieldLayout/README.md) provides the default label → children →
  supporting messages arrangement, owning the base element by default. Fields
  with an engine-owned root select it with `baseAs` and configure it with `baseProps`
- [FieldLabel](./FieldLabel/README.md) renders the label and required indicator,
  and is also exported for custom controls. Use its native label
  with `htmlFor`, React Aria `Label` for field context, or a `span`/`div` when
  the field already owns the label or group heading
- [FieldHelper](./FieldHelper/README.md) renders the helper wrapper below the
  control, with help text and visible validation messages, and is also exported
  for custom controls
- `FieldDescription` renders help text with the supplied description ID
- [FieldValidationError](./FieldValidationError/README.md) owns validation message
  rendering, animations and the optional error association wrapper

- [RadioGroupField](./RadioGroupField/README.md) provides the shared radio-group
  engine and form focus routing, with explicit values and callbacks

Radio-specific option presentation lives with
[Radios](../Radios/subcomponents/README.md), and RadioBoxes reuses it directly.

For example, a native control keeps its label association explicit:

```tsx
<FieldLabel htmlFor={ids.control} id={ids.label} required={required}>
  {label}
</FieldLabel>
<input aria-describedby={ids.description} id={ids.control} />
<FieldHelper
  description={description}
  errorMessage={errorMessage}
  ids={ids}
  invalid={invalid}
/>
```

Use `FieldLayout` for the usual arrangement. Fields with a different structure
compose `FieldLabel` and `FieldHelper` directly. `FieldHelper` owns the helper
wrapper and validation visibility, for `FieldLayout` and those fields alike. The field engine retains its root
and context. The binding supplies IDs and metadata, and renderers derive control
associations through `getFieldControlProps`. `useUniformField`
returns a rendered `field.errorMessage` using `FieldValidationError`. `FieldHelper` places
that node inside its styled error association wrapper.

Pure field helpers live under `helpers/`, including
[fieldProps](../helpers/fieldProps/fieldProps.ts). See the
[helpers guide](../helpers/README.md) for attribute ownership.
The partials use shared presentation contracts from `types.ts`.
