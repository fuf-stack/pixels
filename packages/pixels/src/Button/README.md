# Button

Action button with optional icon and loading feedback.

```tsx
import Button from '@fuf-stack/pixels/Button';

<Button color="primary" onClick={handleSave}>
  Save changes
</Button>;
```

- `onClick` receives a React Aria press event for pointer, keyboard and assistive technology activation
- `loading` shows a decorative spinner and disables activation, the button keeps its accessible name
- Icon-only buttons need `ariaLabel`
- The default native type is `button`, use `type="submit"` or `type="reset"` for form actions
- The forwarded ref points to the native button, `form` can associate it with an external form
- `className` and the exported `buttonVariants` recipe use the current [styling instance](../../../../docs/styling.md), the recipe continues to return a single class string

[Props](./Button.tsx) · [Stories](./stories/Button.stories.tsx) · [ButtonGroup](../ButtonGroup/README.md) · [React Aria Button](https://react-aria.adobe.com/Button)
