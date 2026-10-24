# Table

Column-based data grid with native table elements and optional virtual scrolling.

```tsx
import Table from '@fuf-stack/pixels/Table';

<Table
  ariaLabel="Employees"
  columns={[{ key: 'name', label: 'Name' }]}
  rows={[{ key: 'alex', name: 'Alex' }]}
/>;
```

- Row keys stay unique, each column key reads that property from the row
- The first column supplies row headings, rich React content and numeric zero work
- Arrow keys navigate the full grid, including virtual rows beyond the mounted window
- Virtualization always creates a scroll surface, `maxTableHeight` defaults to 600
  and fixed `rowHeight` defaults to 40 pixels
- Virtual rows retain native table markup, content-based column sizing and full
  accessibility counts, spacer rows are hidden from assistive technology
- Loading keeps existing rows and marks the grid busy, the overlay announces its content
- `hasWrapper`, `hideHeader`, `stickyHeader`, bottom content and all existing slots remain supported
- Selection and sorting are not exposed by this component's public API

[Props](./Table.tsx) · [Stories](./stories/Table.stories.tsx) ·
[React Aria table hooks](https://react-aria.adobe.com/Table/useTable)
