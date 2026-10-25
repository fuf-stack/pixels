# DataTable

Data table with sorting, search, selection, pagination and virtual scrolling.

```tsx
<DataTable columns={columns} data={rows} features={{ pagination: true }} />
```

`DataTable` resolves styling. `DataTableControl` owns feature configuration and
connects the tested table controller. Subcomponents own toolbar/search
interactions, header/state rows, standard/virtual surfaces and pagination.
The main props and feature types stay in `DataTable.tsx`, slot recipes and
derived styling types live in `dataTableVariants.ts`.

Normal stories show feature combinations. Edge cases cover an empty filtered
result while preserving headers. Infinite-loading retry and expansion behavior
remain covered by component and controller tests.

[Props](./DataTable.tsx) · [Stories](./stories/DataTable.stories.tsx) ·
[Styling](../../../../docs/styling.md)
