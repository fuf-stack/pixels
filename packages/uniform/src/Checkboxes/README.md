# Checkboxes

A group of checkboxes for choosing multiple options.

## Usage

```tsx
import Checkboxes from '@fuf-stack/uniform/Checkboxes';
import Form from '@fuf-stack/uniform/Form';

<Form initialValues={{ interests: [] }} onSubmit={console.log}>
  <Checkboxes
    label="Interests"
    name="interests"
    options={[
      { value: 'design', label: 'Design' },
      { value: 'development', label: 'Development' },
    ]}
  />
</Form>;
```

## Notes

- Stores an array of selected string values.
- Use `disabled` on an option to disable only that checkbox.

[Props](Checkboxes.tsx) · [Stories](stories/Checkboxes.stories.tsx)

## Composition

`Checkboxes` owns array-value registration and transforms. `CheckboxesControl`
normalizes non-array values to an empty selection and owns group composition and focus routing, while `CheckboxControl` renders each
option engine and accessible associations. `CheckboxIndicator` owns the animated
checkmark, and `CheckboxLabel` owns the option text and supporting line. Recipes
live in `checkboxesVariants.ts`.

Each option uses React Aria `CheckboxField` for selection and input associations,
and `CheckboxButton` for its clickable label and interaction states. The field
wrapper uses `display: contents` to preserve option layout and existing styling slots.

`CheckboxesControl` uses `FieldLayout` with `baseAs={CheckboxGroup}` for the
group root, label and supporting messages.
Option rendering and custom children remain inside the checkbox group.
