# Card

Bordered content surface with an optional heading and footer.

```tsx
import Card from '@fuf-stack/pixels/Card';

<Card header="Project" footer="Updated today">
  Project details
</Card>;
```

- Header and footer each add a divider when present
- The body remains available even without content
- The forwarded ref targets the outer div, which supports programmatic focus
  without adding a tab stop
- Actions inside a card retain their own keyboard behavior
- Slots cover the surface, header, body, footer and dividers

[Props](./Card.tsx) · [Stories](./stories/Card.stories.tsx)
