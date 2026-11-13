# megapixels

## DataTable and TanStack Table v9

DataTable uses the native v9 `useTable` API. Sorting, filtering, pagination,
selection, visibility and nested expansion retain their existing component
behavior. Server mode continues to bypass local filtering and sorting, and
disabling pagination returns all rows.

### Migrating column definitions and callbacks

This update changes the public TanStack types used by DataTable, so applications
that define columns or call TanStack APIs directly need the changes below.

Import feature-bound types from megapixels instead of v8's `ColumnDef<Row>` and
`Row<Data>` imports. The component's `DataTableProps<TData, TValue>` generic order
is unchanged.

```tsx
import type {
  DataTableColumnDef,
  DataTableRow,
} from '@fuf-stack/megapixels/DataTable';

import { DataTable } from '@fuf-stack/megapixels/DataTable';

type Person = { name: string };
const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    sortFn: (a, b) => a.original.name.localeCompare(b.original.name),
  },
];
const renderDetails = (row: DataTableRow<Person>) => row.original.name;
```

V9 renames `sortingFn` to `sortFn` and replaces `table.getState()` with
`table.state`. Custom cell/header callbacks receive native v9 contexts; migrate
any direct TanStack API calls using the [official migration guide](https://tanstack.com/table/latest/docs/framework/react/guide/migrating).
`DataTableTanStackFeatures` is exported for consumers needing other native v9
types or column helpers with the same feature set. The integration registers
stock column features plus the sorting, filtering, expansion and pagination row
models explicitly; it does not use the deprecated legacy adapter.
