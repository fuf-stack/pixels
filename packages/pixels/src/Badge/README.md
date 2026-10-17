# Badge

Attach a count or status indicator to another element.

```tsx
<Badge content={3} color="primary">
  <button type="button">Messages</button>
</Badge>
```

`undefined` content returns the children without a wrapper. Zero remains visible;
an empty string creates a status dot. Single characters use a circle automatically,
and `isOneChar` forces that shape for longer content. `noOutline` removes the
contrasting border. All four corner placements are supported.

Badge does not add an interactive element or keyboard stop. Keep the wrapped
control's accessible name meaningful, including the count there when needed.

## Styling

`className` accepts a string or `base` and `badge` slot overrides. Recipes use
`StylingProvider`, see the [styling guide](../../../../docs/styling.md).
