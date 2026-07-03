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

const renderDataTableController = ({
  controllerColumns = columns,
  enablePagination = true,
  enableRowSelection = false,
  pageSizeOptions = [10],
}: {
  controllerColumns?: ColumnDef<Row>[];
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  pageSizeOptions?: number[];
} = {}) =>
  renderHook(() =>
    useDataTableController({
      checkboxClassNames: {},
      columns: controllerColumns,
      data: rows,
      enablePagination,
      enableRowSelection,
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
