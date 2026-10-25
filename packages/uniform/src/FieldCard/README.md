# FieldCard

A labeled card that groups nested fields and their validation feedback.

## Usage

```tsx
import FieldCard from '@fuf-stack/uniform/FieldCard';
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';

<Form initialValues={{ contact: { email: '' } }} onSubmit={console.log}>
  <FieldCard label="Contact" name="contact">
    <Input label="Email" name="contact.email" />
  </FieldCard>
</Form>;
```

## Notes

- Name child fields explicitly under the card’s path; the card does not prefix them automatically.
- The card shows group validation feedback and reflects visible child errors.

[Props](FieldCard.tsx) · [Stories](stories/FieldCard.stories.tsx)

## Composition

`FieldCard` connects its field binding to the local
[`useFieldCardValidation`](hooks/useFieldCardValidation.ts) hook,
which owns child-validation visibility and required-state rules.
`FieldCardControl` owns the card, heading, content layout and error footer. The
footer receives validation data and IDs without registering another field.
