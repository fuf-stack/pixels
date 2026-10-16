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

[Props](Checkboxes.tsx) · [Stories](Checkboxes.stories.tsx)

## Composition

`Checkboxes` owns array-value registration and transforms. `CheckboxesControl`
owns group composition and focus routing, while `CheckboxControl` renders each
option and its selection indicator. Recipes live in `checkboxesVariants.ts`.
