# RadioBoxes

Card-style radio options for choosing one value.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import RadioBoxes from '@fuf-stack/uniform/RadioBoxes';

<Form onSubmit={console.log}>
  <RadioBoxes
    label="Plan"
    name="plan"
    options={[
      { value: 'basic', label: 'Basic', description: 'For small projects' },
      { value: 'team', label: 'Team', description: 'For shared projects' },
    ]}
  />
</Form>;
```

## Notes

- Stores one string or number value.
- Options support descriptions, icons and individual disabled states.

## Internal composition

The binding keeps form registration, while the control converts option keys to
their original value types. Shared
`RadioGroupField` owns the React Aria engine and routes form focus requests to
the selected enabled option, or the first enabled option. `FieldLayout` uses
React Aria `Label` for group naming and arranges the options and supporting
messages. `RadioControl` owns each option's label, description and indicator.

[Shared engine](../partials/RadioGroupField/README.md) · [Option renderer](../Radios/subcomponents/README.md)

[Props](RadioBoxes.tsx) · [Stories](stories/RadioBoxes.stories.tsx)

## Composition

`RadioBoxes` owns field registration. `RadioBoxesControl` owns option value
conversion, group layout, option rendering and styling. The shared
radio engine routes focus and preserves group and option descriptions.
