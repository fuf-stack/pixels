# Avatar

Profile image with custom fallback content or a placeholder icon.

```tsx
<Avatar src="/profile.png" fallback="JD" bordered />
```

Custom fallback content stays visible until the image loads and remains visible
if loading fails. Without a source or fallback, Avatar shows a person icon.
A failed image without a custom fallback keeps the previous empty appearance.
Changing `src` starts a fresh loading state.

Avatar is presentational and adds no keyboard stop. Give an enclosing button or
link its own accessible name. Images and fallback content retain the existing
`avatar` accessible name.

## Styling

`className` accepts a string or the `base`, `fallback`, `icon`, `img` and `name`
slots. `name` supports AvatarGroup's overflow count. Recipes resolve through
`StylingProvider`, see the [styling guide](../../../../docs/styling.md).
