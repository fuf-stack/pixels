# FieldCopyTestIdButton

A small debug button that copies a test ID to the clipboard.

## Usage

```tsx
import FieldCopyTestIdButton from '@fuf-stack/uniform/partials/FieldCopyTestIdButton';

<FieldCopyTestIdButton testId="contact_email" />;
```

## Notes

- Copies the supplied string using the browser Clipboard API.
- Normally displayed by Uniform’s test-ID debug mode; it can also be rendered directly.

[Props](FieldCopyTestIdButton.tsx) · [Stories](stories/FieldCopyTestIdButton.stories.tsx)
