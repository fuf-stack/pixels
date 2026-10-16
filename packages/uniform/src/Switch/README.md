# Switch

A toggle for a boolean form value.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Switch from '@fuf-stack/uniform/Switch';

<Form initialValues={{ notifications: false }} onSubmit={console.log}>
  <Switch label="Email notifications" name="notifications" />
</Form>;
```

## Notes

- Stores a boolean value.
- Use `thumbIcon`, `startContent` and `endContent` for additional visual cues.

[Props](Switch.tsx) · [Stories](Switch.stories.tsx)
