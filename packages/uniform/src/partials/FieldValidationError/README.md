# FieldValidationError

Animated validation messages, with an optional wrapper associated with a field.

## Usage

```tsx
import FieldValidationError from '@fuf-stack/uniform/partials/FieldValidationError';

<FieldValidationError
  error={[{ type: 'required', message: 'Email is required' }]}
  testId="email"
/>;
```

## Notes

- Receives an array of field errors; it does not register or validate a field.
- The caller controls when errors are shown. Animations respect reduced motion.
- Without `id`, renders the existing standalone list. A string `className` still
  styles that list.

## Field association

The private `useUniformField` hook returns this component as a rendered
`errorMessage`. Field layouts place that node inside their own styled wrapper
with the shared error ID.

For direct rendering from error data, supply `id` to include the association
wrapper:

```tsx
<input aria-describedby={invalid ? ids.error : undefined} />;
{
  invalid ? (
    <FieldValidationError
      className={{ wrapper: classNames.errorMessage }}
      error={errors}
      id={ids.error}
      testId={testId}
    />
  ) : null;
}
```

The wrapper owns `data-slot="error-message"`. No additional error component is
needed. The `base`, `item`, `message` and `wrapper` slots style the list, animated
entries, padded message content and association wrapper respectively. The
wrapper is rendered only when `id` is supplied. Neither mode adds a live region.

[Props](FieldValidationError.tsx) · [Stories](stories/FieldValidationError.stories.tsx)
