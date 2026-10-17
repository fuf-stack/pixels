# Label

Compact category or status text, with an optional icon and close action.

```tsx
<Label color="success" variant="flat" onClose={handleRemove}>
  Active
</Label>
```

Use `icon` before text or on its own. `endContent` appears after the text; when
`onClose` is present, it becomes the close action's content. The close action
supports pointer, Enter and Space activation. The callback receives a React Aria
press event, and the caller decides whether to remove the label.

The existing `close chip` accessible name is retained. Label itself adds no
keyboard stop. Use meaningful text when an icon alone would be ambiguous.

## Styling

`className` accepts a string or `base`, `closeButton`, `content`, `dot`,
`endContent` and `icon` slots. The six treatments, seven colors including `info`,
three sizes and five radii resolve through `StylingProvider`.

See the [styling guide](../../../../docs/styling.md) and
[React Aria Button](https://react-aria.adobe.com/Button) for the close action.
