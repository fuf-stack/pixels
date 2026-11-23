# FieldLabel

Field label with Uniform's required indicator, for custom controls that render
their own field markup.

## Usage

```tsx
import FieldLabel from '@fuf-stack/uniform/partials/FieldLabel';

<FieldLabel
  className="block pb-1.5 text-small text-foreground"
  htmlFor={controlId}
  id={labelId}
  required={required}
>
  Notes
</FieldLabel>;
```

## Notes

- Renders nothing without children. The required `*` is hidden from the
  accessible name.
- Unstyled by default, the caller supplies the label classes. `requiredClassName`
  styles the indicator (default `ml-0.5 text-danger`).
- Renders a native `label` with `htmlFor`. Use `as` for React Aria `Label` inside
  a React Aria field, or `span`/`div` when another element names the control.
- Does not register a field or read form state. Pair it with public
  `useController`, `useFormContext` and
  [FieldValidationError](../FieldValidationError/README.md).
