import type { ColumnDef } from '@tanstack/react-table';

import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import {
  getSortIndicator,
  useDataTableController,
} from './useDataTableController';

interface Row {
  amount: number;
  email: string;
  subRows?: Row[];
}

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'email',
    enableSorting: true,
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
];

const rows: Row[] = [
  { amount: 100, email: 'zoe@example.com' },
  { amount: 200, email: 'amelia@example.com' },
];

const nestedRows: Row[] = [
  {
    amount: 100,
    email: 'parent@example.com',
    subRows: [{ amount: 50, email: 'child@example.com' }],
  },
  { amount: 200, email: 'leaf@example.com' },
];

const renderDataTableController = ({
  controllerColumns = columns,
  enableExpandableRows = false,
  enablePagination = true,
  enableServerMode = false,
  enableRowSelection = false,
  getSubRows = undefined,
  hasExpandableRowContent = false,
  pageSizeOptions = [10],
  controllerRows = rows,
}: {
  controllerColumns?: ColumnDef<Row>[];
  enableExpandableRows?: boolean;
  enablePagination?: boolean;
  enableServerMode?: boolean;
  enableRowSelection?: boolean;
  getSubRows?: (originalRow: Row, index: number) => Row[] | undefined;
  hasExpandableRowContent?: boolean;
  pageSizeOptions?: number[];
  controllerRows?: Row[];
} = {}) =>
  renderHook(() =>
    useDataTableController({
      checkboxClassNames: {},
      columns: controllerColumns,
      data: controllerRows,
      enableExpandableRows,
      enablePagination,
      enableServerMode,
      enableRowSelection,
      expansionClassNames: {},
      getSubRows,
      hasExpandableRowContent,
      pageSizeOptions,
    }),
  );

// Hook-focused tests validate controller behavior independent of JSX layout.
describe('useDataTableController', () => {
  it('adds selection column when enabled', () => {
    const { result } = renderDataTableController({ enableRowSelection: true });

    expect(result.current.tableColumns[0]?.id).toBe('__select');
    expect(result.current.tableColumns).toHaveLength(columns.length + 1);
  });

  it('keeps original columns when selection is disabled', () => {
    const { result } = renderDataTableController();

    expect(result.current.tableColumns).toHaveLength(columns.length);
    expect(result.current.tableColumns[0]?.id).not.toBe('__select');
  });

  it('adds expansion column and stores expanded row state when expandable rows are enabled', () => {
    const { result } = renderDataTableController({
      enableExpandableRows: true,
      hasExpandableRowContent: true,
    });

    expect(result.current.tableColumns[0]?.id).toBe('__expand');
    expect(result.current.tableColumns).toHaveLength(columns.length + 1);

    act(() => {
      result.current.table.getRowModel().rows[0]?.toggleExpanded(true);
    });

    expect(result.current.table.getState().expanded).toEqual({ 0: true });
  });

  it('uses getSubRows for hierarchical expansion', () => {
    const { result } = renderDataTableController({
      controllerRows: nestedRows,
      enableExpandableRows: true,
      getSubRows: (row) => row.subRows,
    });

    expect(result.current.table.getRowModel().rows).toHaveLength(2);
    expect(result.current.table.getRowModel().rows[0]?.getCanExpand()).toBe(
      true,
    );
    expect(result.current.table.getRowModel().rows[1]?.getCanExpand()).toBe(
      false,
    );

    act(() => {
      result.current.table.getRowModel().rows[0]?.toggleExpanded(true);
    });

    expect(result.current.table.getRowModel().rows).toHaveLength(3);
    expect(result.current.table.getRowModel().rows[1]?.original.email).toBe(
      'child@example.com',
    );
  });

  it('keeps the injected selection column fixed and non-sortable', () => {
    const { result } = renderDataTableController({ enableRowSelection: true });

    const selectionColumn = result.current.table.getColumn('__select');
    expect(selectionColumn?.getCanHide()).toBe(false);
    expect(selectionColumn?.getCanSort()).toBe(false);
  });

  it('stores filter values in TanStack column filter state', () => {
    const { result } = renderDataTableController();

    act(() => {
      result.current.table.getColumn('email')?.setFilterValue('amelia');
    });

    expect(result.current.table.getState().columnFilters).toEqual([
      { id: 'email', value: 'amelia' },
    ]);
  });

  it('stores column visibility changes in TanStack state', () => {
    const { result } = renderDataTableController();

    act(() => {
      result.current.table.getColumn('amount')?.toggleVisibility(false);
    });

    expect(result.current.table.getState().columnVisibility).toEqual({
      amount: false,
    });
  });

  it('uses the first page size option for paginated rows', () => {
    const { result } = renderDataTableController({ pageSizeOptions: [1, 2] });

    expect(result.current.table.getState().pagination.pageSize).toBe(1);
    expect(result.current.table.getRowModel().rows).toHaveLength(1);
  });

  it('keeps all rows in the row model when pagination is disabled', () => {
    const { result } = renderDataTableController({
      enablePagination: false,
      pageSizeOptions: [1],
    });

    expect(result.current.table.getState().pagination.pageSize).toBe(1);
    expect(result.current.table.getRowModel().rows).toHaveLength(rows.length);
  });

  it('falls back to page size 10 when no options are provided', () => {
    const { result } = renderDataTableController({ pageSizeOptions: [] });

    expect(result.current.table.getState().pagination.pageSize).toBe(10);
  });

  it('stores row selection changes in TanStack state', () => {
    const { result } = renderDataTableController({ enableRowSelection: true });

    act(() => {
      result.current.table.getRowModel().rows[0]?.toggleSelected(true);
    });

    expect(result.current.table.getState().rowSelection).toEqual({ 0: true });
  });

  it('keeps columns non-sortable unless they explicitly opt in', () => {
    const columnsWithoutSorting: ColumnDef<Row>[] = [
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
      },
    ];
    const { result } = renderDataTableController({
      controllerColumns: columnsWithoutSorting,
    });

    expect(result.current.table.getColumn('email')?.getCanSort()).toBe(false);
    expect(result.current.table.getColumn('amount')?.getCanSort()).toBe(false);
  });

  it('allows columns to opt into sorting', () => {
    const { result } = renderDataTableController();

    expect(result.current.table.getColumn('email')?.getCanSort()).toBe(true);
    expect(result.current.table.getColumn('amount')?.getCanSort()).toBe(false);
  });

  it('stores sorting changes and returns sorted rows', () => {
    const { result } = renderDataTableController();

    act(() => {
      result.current.table.getColumn('email')?.toggleSorting(false);
    });

    expect(result.current.table.getState().sorting).toEqual([
      { desc: false, id: 'email' },
    ]);
    expect(result.current.table.getRowModel().rows[0]?.original.email).toBe(
      'amelia@example.com',
    );
  });

  it('keeps server ordering when server mode is enabled', () => {
    const { result } = renderDataTableController({
      enableServerMode: true,
    });

    act(() => {
      result.current.table.getColumn('email')?.toggleSorting(false);
    });

    expect(result.current.table.getState().sorting).toEqual([
      { desc: false, id: 'email' },
    ]);
    expect(result.current.table.getRowModel().rows[0]?.original.email).toBe(
      'zoe@example.com',
    );
  });
});

describe('getSortIndicator', () => {
  it('maps sort state and sortability to the expected indicator', () => {
    expect(getSortIndicator(true, 'asc')).not.toBeNull();
    expect(getSortIndicator(true, 'desc')).not.toBeNull();
    expect(getSortIndicator(true, false)).not.toBeNull();
    expect(getSortIndicator(false, false)).toBeNull();
  });

  it('supports custom sort indicators and false to disable them', () => {
    expect(getSortIndicator(true, 'asc', { asc: 'ASC' })).toBe('ASC');
    expect(getSortIndicator(true, 'desc', { desc: 'DESC' })).toBe('DESC');
    expect(getSortIndicator(true, false, { unsorted: 'UNSORTED' })).toBe(
      'UNSORTED',
    );
    expect(getSortIndicator(true, false, { unsorted: false })).toBeNull();
  });
});
