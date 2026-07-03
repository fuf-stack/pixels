import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { useMemo, useState } from 'react';

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import DataTableCheckbox from '../Subcomponents/DataTableCheckbox';

/** Stable id used for the injected row-selection column. */
export const SELECTION_COLUMN_ID = '__select';

type SortState = false | 'asc' | 'desc';

interface SelectionColumnClassNames {
  checkbox?: string;
  checkboxIndicator?: string;
}

interface SelectionColumnIcons {
  checked?: ReactNode | false;
  indeterminate?: ReactNode | false;
}

interface SortIndicatorIcons {
  asc?: ReactNode | false;
  desc?: ReactNode | false;
  unsorted?: ReactNode | false;
}

const SortAscendingIcon = () => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <path
        d="M8 13V3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M4.5 6.5 8 3l3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
};

const SortDescendingIcon = () => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <path
        d="M8 3v10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M4.5 9.5 8 13l3.5-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
};

const SortUnsortedIcon = () => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <path
        d="M5 6 8 3l3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M5 10l3 3 3-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
};

export interface UseDataTableControllerParams<TData, TValue> {
  /** Class names forwarded to the injected selection checkbox column. */
  checkboxClassNames: SelectionColumnClassNames;
  /** Base TanStack column definitions from component props. */
  columns: ColumnDef<TData, TValue>[];
  /** Row data rendered by the table. */
  data: TData[];
  /** Enables TanStack pagination row model and state. */
  enablePagination: boolean;
  /** Enables injected selection column and row selection state. */
  enableRowSelection: boolean;
  /** Available pagination page sizes. First value is initial page size. */
  pageSizeOptions: number[];
  /** Icons used by injected selection controls. */
  selectionIcons?: SelectionColumnIcons;
}

/** Builds the optional leading selection column used by DataTable. */
const createSelectionColumn = <TData, TValue>(
  classNames: SelectionColumnClassNames,
  icons: SelectionColumnIcons | undefined,
): ColumnDef<TData, TValue> => {
  return {
    cell: ({ row }) => {
      return (
        <DataTableCheckbox
          ariaLabel={`Select row ${row.id}`}
          checked={row.getIsSelected()}
          checkedIcon={icons?.checked}
          className={{
            checkbox: classNames.checkbox,
            checkboxIndicator: classNames.checkboxIndicator,
          }}
          indeterminateIcon={icons?.indeterminate}
          onCheckedChange={(checked) => {
            row.toggleSelected(checked);
          }}
        />
      );
    },
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => {
      return (
        <DataTableCheckbox
          ariaLabel="Select all rows on page"
          checked={table.getIsAllPageRowsSelected()}
          checkedIcon={icons?.checked}
          className={{
            checkbox: classNames.checkbox,
            checkboxIndicator: classNames.checkboxIndicator,
          }}
          indeterminate={
            !table.getIsAllPageRowsSelected() &&
            table.getIsSomePageRowsSelected()
          }
          indeterminateIcon={icons?.indeterminate}
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(checked);
          }}
        />
      );
    },
    id: SELECTION_COLUMN_ID,
    size: 36,
  };
};

/** Maps TanStack sort state to the header indicator glyph. */
export const getSortIndicator = (
  canSort: boolean,
  sortState: SortState,
  icons: SortIndicatorIcons = {},
): ReactNode | null => {
  const ascIcon = icons.asc ?? <SortAscendingIcon />;
  const descIcon = icons.desc ?? <SortDescendingIcon />;
  const unsortedIcon = icons.unsorted ?? <SortUnsortedIcon />;

  if (sortState === 'asc') {
    return ascIcon === false ? null : ascIcon;
  }
  if (sortState === 'desc') {
    return descIcon === false ? null : descIcon;
  }
  if (canSort) {
    return unsortedIcon === false ? null : unsortedIcon;
  }
  return null;
};

/**
 * Central controller hook for DataTable state and TanStack wiring.
 *
 * Keeps stateful table mechanics out of the render component so `DataTable.tsx`
 * can stay focused on structure/markup.
 */
export const useDataTableController = <TData, TValue>({
  checkboxClassNames,
  columns,
  data,
  enablePagination,
  enableRowSelection,
  pageSizeOptions,
  selectionIcons = undefined,
}: UseDataTableControllerParams<TData, TValue>) => {
  // Stateful table mechanics managed by TanStack.
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  // Inject selection column only when the feature is enabled.
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) {
      return columns;
    }
    const selectColumn = createSelectionColumn<TData, TValue>(
      checkboxClassNames,
      selectionIcons,
    );
    return [selectColumn, ...columns];
  }, [checkboxClassNames, columns, enableRowSelection, selectionIcons]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table intentionally returns function helpers that React Compiler cannot memoize.
  const table = useReactTable({
    columns: tableColumns,
    data,
    defaultColumn: {
      enableSorting: false,
    },
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting,
    },
  });

  return {
    table,
    tableColumns,
  };
};
