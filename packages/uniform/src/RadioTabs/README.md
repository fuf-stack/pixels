# RadioTabs

Tab-style choices connected to a single form value.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import RadioTabs from '@fuf-stack/uniform/RadioTabs';

<Form onSubmit={console.log}>
  <RadioTabs
    label="Billing"
    name="billing"
    options={[
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
    ]}
  />
</Form>;
```

## Notes

- Option values can be strings, numbers or booleans.
- An option’s `content` is shown when selected. Use `fullWidth` to fill the available width.
- Style help text and validation through the `description`, `errorMessage` and
  `helperWrapper` slots in `className`, using the same recipe as the tabs.

[Props](RadioTabs.tsx) · [Stories](stories/RadioTabs.stories.tsx)

## Composition

`RadioTabs` owns registration. `RadioTabsControl` owns option value conversion,
form-focus routing and `FieldLayout`. `RadioTabsList` owns the tab engine,
selection indicator geometry and optional panels. `RadioTab` owns each option’s
label, panel association and interaction attributes.
