# Select

A searchable single- or multi-select field.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Select from '@fuf-stack/uniform/Select';

<Form onSubmit={console.log}>
  <Select
    label="Country"
    name="country"
    options={[
      { value: 'de', label: 'Germany' },
      { value: 'nl', label: 'Netherlands' },
    ]}
  />
</Form>;
```

## Notes

- Stores option values, rather than option objects. `multiSelect` stores an array of values.
- Use `selectedOptionFallback` when a selected value may be absent from the current option list, such as during asynchronous search.

[Props](Select.tsx) · [Stories](stories/Select.stories.tsx)

## Composition

`Select` registers the field and supplies a current touched-state accessor.
`SelectControl` owns field layout and slot resolution. `SelectCombobox` owns
React Select configuration, option conversion and fallbacks, focus styling and
deferred touched updates. Engine adapters live under `subcomponents/`.
