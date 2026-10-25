# VirtualList

Scrollable list that renders visible items and optionally loads cursor pages.

```tsx
<VirtualList
  data={items}
  renderItem={(item) => <div>{item.name}</div>}
  virtualization={{ maxHeight: 300 }}
/>
```

`VirtualList` resolves styling. `VirtualListControl` models loaded items,
placeholders and the load-more row, and connects the shared virtualizer.
`VirtualListRow` owns each row's markup and measured position. Recipes live
in `virtualListVariants.ts`.

Loaded-count and total-count scrolling, retry and variable row heights remain
covered by existing tests/stories. The edge-case group covers an empty list.

[Props](./VirtualList.tsx) · [Stories](./stories/VirtualList.stories.tsx) ·
[Styling](../../../../docs/styling.md)
