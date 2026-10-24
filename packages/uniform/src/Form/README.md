# Form

Form state, Veto validation and submission for Uniform fields.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';
import { string, veto } from '@fuf-stack/veto';

<Form
  initialValues={{ email: '' }}
  validation={veto({ email: string() })}
  onSubmit={console.log}
>
  <Input label="Email" name="email" />
  <SubmitButton>Save</SubmitButton>
</Form>;
```

## Notes

- Render registered Uniform fields inside Form. `name` identifies a field in form state.
- `onSubmit` receives validated, normalized values. Use `validationTrigger` to change validation timing.
- Use `debug={{ disable: true }}` to hide the development debug viewer.

[Props](Form.tsx) · [Examples](stories/FormComposition.stories.tsx)
