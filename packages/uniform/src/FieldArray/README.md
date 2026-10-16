# FieldArray

A repeatable set of fields with add/remove actions and optional sorting.

## Usage

```tsx
import FieldArray from '@fuf-stack/uniform/FieldArray';
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';

<Form initialValues={{ contacts: [] }} onSubmit={console.log}>
  <FieldArray
    label="Contacts"
    name="contacts"
    elementInitialValue={{ name: '' }}
  >
    {({ name }) => <Input label="Name" name={`${name}.name`} />}
  </FieldArray>
</Form>;
```

## Notes

- The render callback supplies each row’s field path. Use it when naming child inputs.
- `flat` supports arrays of primitive values. In that mode, pass the supplied `name` directly to the input.
- `sortable`, `duplicate` and `insertAfter` enable additional row actions.

[Props](types.ts) · [Stories](FieldArray.stories.tsx)
