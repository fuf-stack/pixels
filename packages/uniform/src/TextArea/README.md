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

[Props](TextArea.tsx) · [Stories](TextArea.stories.tsx)
