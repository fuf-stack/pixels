# Popover

Anchored popup for supporting information or related actions.

```tsx
import Popover from '@fuf-stack/pixels/Popover';

<Popover header="Delivery" content="Usually arrives within three working days">
  Delivery details
</Popover>;
```

- `header` names the dialog, otherwise the trigger provides its accessible name
- Escape and outside presses close it, focus returns to the trigger unless the user moves elsewhere
- `openControlled={{ open, setOpen }}` lets the caller own visibility
- `shouldBlockScroll` prevents page scrolling independently of outside interaction, the body still scrolls
- `placement` retains hyphenated names such as `bottom-start`, the popup flips when space is limited
- `portalContainer` accepts a DOM Element, styled triggers use `triggerButtonProps`

`className` accepts a trigger class or overrides for `base`, `body`, `content`,
`divider`, `footer`, `footerWrapper`, `header`, `headerWrapper`, `overlay` and
`trigger`. `base` includes the arrow, `content` is the rounded panel.

[Props](./Popover.tsx) · [Stories](./stories/Popover.stories.tsx) · [Styling](../../../../docs/styling.md) · [React Aria Popover](https://react-aria.adobe.com/Popover)
