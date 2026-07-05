import type { ColumnDef } from '@tanstack/react-table';

import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DataTable from './DataTable';
import * as stories from './DataTable.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

interface Row {
  amount: number;
  email: string;
  status: 'failed' | 'success';
  subRows?: Row[];
}

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
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
  { amount: 100, email: 'zoe@example.com', status: 'success' },
  { amount: 200, email: 'amelia@example.com', status: 'failed' },
];

const infiniteScrollFeature = {
  onLoadMore: () => undefined,
  pageInfo: {
    endCursor: 'cursor-1',
    hasNextPage: true,
    totalCount: 100,
  },
} as const;

const nestedRows: Row[] = [
  {
    amount: 100,
    email: 'parent@example.com',
    status: 'success',
    subRows: [
      {
        amount: 50,
        email: 'child@example.com',
        status: 'success',
        subRows: [
          {
            amount: 25,
            email: 'grandchild@example.com',
            status: 'failed',
          },
        ],
      },
    ],
  },
];

describe('DataTable interactions', () => {
  it('searches rows through the configured search column', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          rowSelection: false,
          search: { columns: [{ column: 'email' }] },
        }}
      />,
    );

    await user.type(screen.getByPlaceholderText('Search...'), 'amelia');

    expect(screen.getByText('amelia@example.com')).toBeInTheDocument();
    expect(screen.queryByText('zoe@example.com')).not.toBeInTheDocument();
  });

  it('supports multiple built-in search inputs', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          search: {
            columns: [
              { column: 'email', placeholder: 'Search email...' },
              { column: 'status', placeholder: 'Search status...' },
            ],
          },
          rowSelection: false,
        }}
        testId="dt-multi-search"
      />,
    );

    await user.type(
      screen.getByTestId('dt-multi-search-search-email'),
      'amelia',
    );
    await user.type(
      screen.getByTestId('dt-multi-search-search-status'),
      'failed',
    );

    expect(screen.getByText('amelia@example.com')).toBeInTheDocument();
    expect(screen.queryByText('zoe@example.com')).not.toBeInTheDocument();
  });

  it('sorts rows when clicking a sortable column header', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ rowSelection: false }}
      />,
    );

    expect(screen.queryByRole('button', { name: /Status/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Email/ }));

    const tableRows = screen.getAllByRole('row').slice(1);
    expect(
      within(tableRows[0]).getByText('amelia@example.com'),
    ).toBeInTheDocument();
    expect(
      within(tableRows[1]).getByText('zoe@example.com'),
    ).toBeInTheDocument();
  });

  it('supports custom sort icons via icons prop', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ rowSelection: false }}
        icons={{
          sort: {
            asc: 'ASC_ICON',
            desc: 'DESC_ICON',
            unsorted: 'UNSORTED_ICON',
          },
        }}
      />,
    );

    expect(screen.getAllByText(/UNSORTED_ICON/)).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /Email/ }));
    expect(screen.getAllByText(/ASC_ICON/)).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /Email/ }));
    expect(screen.getAllByText(/DESC_ICON/)).toHaveLength(1);
  });

  it('allows disabling built-in icons with false', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ columnVisibility: true, rowSelection: true }}
        icons={{
          columnVisibility: { visible: false },
          selection: { checked: false, indeterminate: false },
          sort: { unsorted: false },
        }}
        testId="dt-no-icons"
      />,
    );

    expect(screen.queryByText('↕')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Select row 0'));
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
    await user.click(
      screen.getByTestId('dt-no-icons-column-visibility-trigger'),
    );
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('toggles column visibility from view options menu', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ columnVisibility: true, rowSelection: false }}
        testId="dt"
      />,
    );

    await user.click(screen.getByTestId('dt-column-visibility-trigger'));
    await user.click(await screen.findByRole('menuitem', { name: /status/i }));

    expect(
      screen.queryByRole('columnheader', { name: 'Status' }),
    ).not.toBeInTheDocument();
  });

  it('shows column header labels in the view options menu', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ columnVisibility: true, rowSelection: false }}
        testId="dt-labels"
      />,
    );

    await user.click(screen.getByTestId('dt-labels-column-visibility-trigger'));

    expect(
      await screen.findByRole('menuitem', { name: /Amount/ }),
    ).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: /Status/ })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'amount' })).toBeNull();
  });

  it('renders custom toolbar content', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ rowSelection: false }}
        toolbarContent={<div>Custom toolbar</div>}
      />,
    );

    expect(screen.getByText('Custom toolbar')).toBeTruthy();
  });

  it('wraps selection controls in centered selection cells', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ rowSelection: true }}
      />,
    );

    expect(
      container.querySelectorAll('[data-slot="selection-cell"]').length,
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll('[data-slot="selection-cell-content"]').length,
    ).toBeGreaterThan(0);
  });

  it('expands and collapses custom row content', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          expandableRows: {
            renderContent: (row) => <div>Details for {row.original.email}</div>,
          },
          rowSelection: false,
        }}
      />,
    );

    expect(
      screen.queryByText('Details for zoe@example.com'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Expand row 0'));
    expect(screen.getByText('Details for zoe@example.com')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Collapse row 0'));
    expect(
      screen.queryByText('Details for zoe@example.com'),
    ).not.toBeInTheDocument();
  });

  it('expands multiple levels of nested sub rows', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={nestedRows}
        features={{
          expandableRows: {
            getSubRows: (row) => row.subRows,
          },
          rowSelection: false,
        }}
      />,
    );

    expect(screen.queryByText('child@example.com')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Expand row 0'));
    expect(screen.getByText('child@example.com')).toBeInTheDocument();
    expect(
      screen.queryByText('grandchild@example.com'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Expand row 0.0'));
    expect(screen.getByText('grandchild@example.com')).toBeInTheDocument();
  });

  it('updates row selection summary when selecting rows', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ pagination: true, rowSelection: true }}
      />,
    );

    expect(screen.queryByText(/row\(s\) selected/i)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Select row 0'));
    expect(screen.getByText('1 of 2 row(s) selected.')).toBeInTheDocument();
  });

  it('selects all page rows from the header checkbox', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ pagination: true, rowSelection: true }}
      />,
    );

    await user.click(screen.getByLabelText('Select all rows on page'));

    expect(screen.getByText('2 of 2 row(s) selected.')).toBeInTheDocument();
  });

  it('navigates between pages', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          pagination: { pageSizeOptions: [1] },
          rowSelection: false,
        }}
        testId="dt-page"
      />,
    );

    expect(screen.getByText('zoe@example.com')).toBeInTheDocument();
    expect(screen.queryByText(/row\(s\) selected/i)).not.toBeInTheDocument();
    await user.click(screen.getByTestId('dt-page-next-page'));
    expect(screen.getByText('amelia@example.com')).toBeInTheDocument();
    expect(screen.queryByText('zoe@example.com')).not.toBeInTheDocument();
  });

  it('can hide the rows-per-page selector while keeping pagination', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          pagination: { showRowsPerPage: false },
          rowSelection: false,
        }}
        testId="dt-page-hidden-size"
      />,
    );

    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
    expect(screen.getByTestId('dt-page-hidden-size-next-page')).toBeTruthy();
  });

  it('uses configured rows-per-page menu options', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          pagination: { pageSizeOptions: [1, 2] },
          rowSelection: false,
        }}
        testId="dt-page-size-options"
      />,
    );

    await user.click(screen.getByTestId('dt-page-size-options-page-size'));

    expect(await screen.findByRole('menuitem', { name: /1/ })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: /2/ })).toBeTruthy();
  });

  it('respects features prop for disabling pagination', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{ pagination: false }}
        testId="dt-features-precedence"
      />,
    );

    expect(
      screen.queryByTestId('dt-features-precedence-next-page'),
    ).not.toBeInTheDocument();
  });

  it('disables pagination footer when infinite scroll is enabled', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          infiniteScroll: infiniteScrollFeature,
          pagination: true,
          virtualization: { maxHeight: 300 },
        }}
        testId="dt-infinite-no-pagination"
      />,
    );

    expect(
      screen.queryByTestId('dt-infinite-no-pagination-next-page'),
    ).not.toBeInTheDocument();
  });

  it('disables row selection when infinite scroll is enabled', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          infiniteScroll: infiniteScrollFeature,
          rowSelection: true,
          virtualization: { maxHeight: 300 },
        }}
      />,
    );

    expect(screen.queryByLabelText('Select row 0')).not.toBeInTheDocument();
  });

  it('shows a retry button when loading the next page failed', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={rows}
        features={{
          infiniteScroll: {
            ...infiniteScrollFeature,
            loadMoreError: true,
            onLoadMore,
            retryContent: 'Retry loading page',
          },
          virtualization: { maxHeight: 300 },
        }}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Retry loading page' }),
    );
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
