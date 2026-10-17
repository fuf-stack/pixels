# ScrollShadow

Scrollable content with fading edges that indicate more content.

```tsx
<ScrollShadow className="max-h-64" size={32}>
  {items}
</ScrollShadow>
```

- `orientation` selects vertical or horizontal scrolling
- `visibility="auto"` follows scrolling and content or container resizing
- Explicit edges, `both` and `none` override automatic visibility
- `hideScrollBar` hides the scrollbar without preventing native scrolling
- The ref points to the scrollable div, `style` and `dataSlot` apply to that element

The exported `scrollShadowVariants` recipe and `className` use the active styling
instance. No additional content wrapper is inserted.

[Props](./ScrollShadow.tsx) · [Stories](./stories/ScrollShadow.stories.tsx) · [Styling](../../../../docs/styling.md)
