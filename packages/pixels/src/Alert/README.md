# Alert

Status message with optional title, icon, trailing content and dismissal.

```tsx
import Alert from '@fuf-stack/pixels/Alert';

<Alert title="Saved" variant="success" closable onClose={handleClose}>
  Your changes are stored
</Alert>;
```

The message uses `role="alert"`. The `default` treatment hides its icon; the other
four treatments show a status symbol, replaceable through `icon`.

`closable` or `onClose` displays a native close button. Pointer, Enter and Space
activation hide the alert and call `onClose` once. The button does not submit an
enclosing form. Visibility resets when the component remounts.

## Styling

`className` accepts a string or the `base`, `closeButton`, `description`,
`endContent`, `icon`, `iconWrapper`, `mainWrapper` and `title` slots.
The icon slot now applies to the actual status icon, including custom elements.

See the [styling guide](../../../../docs/styling.md) and
[React Aria Button](https://react-aria.adobe.com/Button).
