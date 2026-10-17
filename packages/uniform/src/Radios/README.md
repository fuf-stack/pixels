# Radios

A radio group for choosing one option.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Radios from '@fuf-stack/uniform/Radios';

<Form onSubmit={console.log}>
  <Radios
    label="Delivery"
    name="delivery"
    options={[
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express' },
    ]}
  />
</Form>;
```

## Notes

- Stores one string or number value.
- Use `inline` for a horizontal layout or the child render function for a custom option layout.

## Internal composition

The binding keeps form registration, while the control converts option keys to
their original value types. Shared
`RadioGroupField` owns the React Aria engine and routes form focus requests to
the selected enabled option, or the first enabled option. `FieldLayout` uses
React Aria `Label` for group naming and arranges the options and supporting
messages. `RadioControl` owns each option's label, description and indicator.

[Shared engine](../partials/RadioGroupField/README.md) · [Option renderer](../Radios/subcomponents/README.md)

[Props](Radios.tsx) · [Stories](stories/Radios.stories.tsx)

## Composition

`Radios` owns field registration. `RadiosControl` owns option value
conversion, group layout, option rendering and styling. The shared
radio engine routes focus and preserves group and option descriptions.
