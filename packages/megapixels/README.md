# megapixels

## DataTable: TanStack Table v9

Column and row types are bound to DataTable's registered features. Import
`DataTableColumnDef` and `DataTableRow` from `@fuf-stack/megapixels/DataTable`
instead of TanStack's `ColumnDef` and `Row`. For direct TanStack API usage
(e.g. `sortingFn` → `sortFn`, `table.getState()` → `table.state`), see the
[v9 migration guide](https://tanstack.com/table/latest/docs/framework/react/guide/migrating).
