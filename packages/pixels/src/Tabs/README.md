# Tabs

Sections of content selected through a row or column of tabs.

```tsx
import Tabs from '@fuf-stack/pixels/Tabs';

<Tabs
  ariaLabel="Project"
  tabs={[
    { key: 'overview', label: 'Overview', content: 'Project overview' },
    { key: 'activity', label: 'Activity', content: 'Recent activity' },
  ]}
/>;
```

- Selection can be controlled or initialized with string or numeric keys
- Arrow keys select enabled tabs, Home and End move to the ends of the list
- Start/end placement and `vertical` use vertical keyboard navigation
- Inactive panels unmount by default, disable `destroyInactiveTabPanel` to retain state
- All seven existing slots remain available through `className`
- The cursor moves through React Aria's shared selection-indicator transition,
  respecting `disableAnimation` and reduced motion

[Props](./Tabs.tsx) · [Stories](./stories/Tabs.stories.tsx) ·
[React Aria Tabs](https://react-aria.adobe.com/Tabs)
