# Tooltip

Supporting information shown beside a trigger on hover or focus.

```tsx
<Tooltip content="Changes are saved automatically">
  <button type="button">Save information</button>
</Tooltip>
```

Use a focusable child for keyboard access. Focus opens the tooltip immediately,
Escape or blur closes it, and hovering the content keeps it visible.
`delay` and `closeDelay` control hover timing. Optional `header` and `footer`
surround the scrollable body, `size` limits section widths.

Existing placement names and styling slots remain supported. The owned recipe
shares arrow geometry with Popover and resolves through the styling provider.
Animations respect reduced motion.

[Props](./Tooltip.tsx) · [Stories](./stories/Tooltip.stories.tsx) · [React Aria Tooltip](https://react-aria.adobe.com/Tooltip)
