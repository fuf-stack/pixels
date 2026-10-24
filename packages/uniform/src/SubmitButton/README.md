# SubmitButton

A submit button for a Uniform form.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';

<Form onSubmit={console.log}>
  <SubmitButton>Save</SubmitButton>
</Form>;
```

## Notes

- Uses native form submission and does not read form context.
- Outside the form, set `remoteFormId` on both Form and SubmitButton to associate them.
- Pass `loading` explicitly when a submission should show a loading state.

[Props](SubmitButton.tsx) · [Stories](stories/SubmitButton.stories.tsx)
