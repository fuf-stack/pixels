# Accordion

Expandable sections with titles, optional subtitles and single or multiple selection.

```tsx
<Accordion
  accordionItems={[{ title: 'Details', children: <p>More information</p> }]}
  defaultSelectedKeys={['0']}
/>
```

Keys are item indexes, accepted as strings or numbers. Use `selectedKeys` and
`onSelectionChange` for controlled expansion; callbacks receive string keys.
`'all'` expands every item. `disallowEmptySelection` keeps the final selected
panel open. Disabled headings are skipped by Arrow Up/Down, Home and End.
Enter and Space toggle the focused heading.

## Styling

The `light`, `shadow`, `bordered` and `splitted` treatments use owned recipes.
`className` accepts a string for `wrapper` or individual slot overrides.
`indicatorLeft`, `hideIndicator` and `showDivider` control heading presentation.
`dividerProps` remains accepted, while dividers are styled through `wrapper`.

See the [styling guide](../../../../docs/styling.md) and
[React Aria Button](https://react-aria.adobe.com/Button).
