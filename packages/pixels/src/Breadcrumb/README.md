# Breadcrumb

Hierarchy of items showing the current page and its parent locations.

```tsx
import Breadcrumb from '@fuf-stack/pixels/Breadcrumb';

<Breadcrumb
  breadcrumbItems={[{ children: 'Home' }, { children: 'Projects' }]}
/>;
```

- The last item represents the current page and is skipped during tab navigation
- Disabled items are skipped too
- Long paths retain the first item and last two, with an ellipsis for the middle
- Items accept content, not navigation destinations, route links remain caller-owned
- String `className` styles the navigation landmark, slot overrides include the
  item, list, separator and collapsed indicator

[Props](./Breadcrumb.tsx) · [Stories](./stories/Breadcrumb.stories.tsx) ·
[React Aria breadcrumbs](https://react-aria.adobe.com/Breadcrumbs)
