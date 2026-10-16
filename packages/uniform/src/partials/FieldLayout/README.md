# FieldLayout

Private default composition of a field label, supplied control content and supporting messages.

## Usage

```tsx
<InputField {...fieldProps}>
  <FieldLayout {...layoutProps}>
    <InputWrapper {...contentProps} />
  </FieldLayout>
</InputField>
```

- Renders a fragment, with no additional DOM wrapper
- The field engine owns the root, `base` classes and interaction context
- Receives IDs, resolved slot classes and validation state from its owner
- Composes `FieldDescription` and the supplied `errorMessage` inside the helper
  wrapper, omitting that wrapper when neither help text nor validation is visible
- Receives a rendered `errorMessage`, normally created by `useUniformField` using
  `FieldValidationError`, and owns its styled wrapper with `ids.error`
- Uses a native label linked to `ids.control` by default. For radio groups, pass
  React Aria `Label` as `labelAs`, leaving the group association to its engine
- The owner supplies the editable control's accessible name and description associations
- Unusual arrangements can compose the individual partials directly

[Props](./FieldLayout.tsx) · [Stories](./FieldLayout.stories.tsx)
