# Drawer

Edge-aligned dialog for supporting content and actions.

```tsx
<Drawer header="Details" isOpen={open} onClose={() => setOpen(false)}>
  {content}
</Drawer>
```

- `placement` selects the left, right, top or bottom edge
- Existing size, radius and backdrop choices remain supported
- Focus stays inside while open, page scrolling is locked and the body scrolls independently
- `onOpenChange` reports visibility requests, `onClose` reports requests to close
- `isDismissable={false}` disables backdrop dismissal, Escape remains available
- `hideCloseButton` hides the visible control, `closeButton` replaces it
- `portalContainer` accepts a DOM Element, motion respects reduced-motion preferences

Drawer reuses Modal's dialog engine and section components. Its recipe extends
Modal's surface recipe and preserves the seven existing styling slots.

[Props](./Drawer.tsx) · [Stories](./stories/Drawer.stories.tsx) · [React Aria Dialog](https://react-aria.adobe.com/Dialog)
