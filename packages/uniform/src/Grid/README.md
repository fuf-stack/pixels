# Grid

A layout grid with standard spacing for form fields.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Grid from '@fuf-stack/uniform/Grid';
import Input from '@fuf-stack/uniform/Input';

<Form onSubmit={console.log}>
  <Grid className="md:grid-cols-2">
    <Input label="First name" name="firstName" />
    <Input label="Last name" name="lastName" />
  </Grid>
</Form>;
```

## Notes

- Uses a CSS grid with `gap-6`; add column utilities through `className`.
- Provides layout only. The inputs still need a surrounding Form.

[Props](./Grid.tsx) · [Stories](./stories/Grid.stories.tsx) · [Form composition](../Form/stories/FormComposition.stories.tsx)
