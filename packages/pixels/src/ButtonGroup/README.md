# ButtonGroup

Related actions arranged as a connected group of buttons.

```tsx
import Button from '@fuf-stack/pixels/Button';
import ButtonGroup from '@fuf-stack/pixels/ButtonGroup';

<ButtonGroup aria-label="Record actions">
  <Button onClick={handleSave}>Save</Button>
  <Button disabled={readOnly} onClick={handleDelete}>
    Delete
  </Button>
</ButtonGroup>;
```

- Renders a `div` with `role="group"` by default, native group attributes and refs are forwarded
- Buttons keep normal tab order, this is not a toolbar with arrow-key navigation
- `fullWidth` stretches the group and its buttons, group size and radius affect connected edges
- Existing Pixels Button defaults retain precedence over group defaults, set `disabled`, `color`, `size` and `variant` on each Button for predictable results
- `className` styles the group, `buttonGroupVariants` exposes its layout recipe

[Props](./ButtonGroup.tsx) · [Stories](./stories/ButtonGroup.stories.tsx) · [Migration details](../../../../docs/pixels/migration.md)
