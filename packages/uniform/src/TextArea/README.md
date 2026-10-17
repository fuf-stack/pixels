# TextArea

Multiline text input with automatic height adjustment.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import TextArea from '@fuf-stack/uniform/TextArea';

<Form onSubmit={console.log}>
  <TextArea label="Notes" name="notes" placeholder="Add a note" />
</Form>;
```

## Notes

- Grows from three to eight rows as content changes.
- Uses the same 300 ms default debounce and blur flushing as Input.

[Props](TextArea.tsx) · [Stories](stories/TextArea.stories.tsx)

## Composition

`TextArea` binds and debounces form values. `TextAreaControl` owns field layout
and root interaction styling. `TextAreaInput` owns the editable ref, React Aria
text binding, wrapper focus and autosizing. Labels, descriptions and validation
messages remain exposed as styling slots alongside the input surface.

Import `textAreaVariants` from `@fuf-stack/uniform/TextArea` to reuse or extend
the slot styles.
