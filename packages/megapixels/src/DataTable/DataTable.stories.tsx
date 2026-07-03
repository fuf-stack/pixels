import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColumnDef } from '@tanstack/react-table';
import type { DataTableProps, DataTableSearchField } from './DataTable';
import type { SnackOrder } from './storybookData';

import { useMemo, useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Label from '@fuf-stack/pixels/Label';

import Filter, { filters as filterRegistry } from '../Filter';
import DataTable from './DataTable';
import {
  compactOrders,
  defaultOrders,
  filterOrders,
  iconOrders,
  playgroundOrders,
  filterOrders as searchOrders,
  statusConfig,
  styledOrders,
} from './storybookData';

// Animations are disabled in the test environment so snapshots are stable.
const isTestEnv = process.env.NODE_ENV === 'test';

const renderStatusLabel = (statusKey: SnackOrder['status']) => {
  const status = statusConfig[statusKey];
  return (
    <Label color={status.color} size="sm" variant="flat">
      {status.label}
    </Label>
  );
};

const defaultColumns: ColumnDef<SnackOrder>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'snack',
    header: 'Snack',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: 'Total',
    cell: ({ row }) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(row.original.amount);
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return renderStatusLabel(row.original.status);
    },
  },
];

const sortableColumns: ColumnDef<SnackOrder>[] = defaultColumns.map(
  (column) => {
    if ('accessorKey' in column) {
      return {
        ...column,
        enableSorting: true,
      };
    }
    return column;
  },
);

const DataTableWithMegapixelsFilter = ({
  disableAnimation = false,
  portalContainer = undefined,
}: {
  disableAnimation?: boolean;
  portalContainer?: HTMLElement;
}) => {
  const [values, setValues] = useState<{
    filter?: Record<string, unknown>;
    search?: string;
  }>({});

  const filteredOrders = useMemo(() => {
    const search = values.search?.toLowerCase().trim() ?? '';
    const statusFilterRaw = values.filter?.status;
    const selectedStatuses = Array.isArray(statusFilterRaw)
      ? statusFilterRaw
          .map(String)
          .filter((status): status is SnackOrder['status'] => {
            return ['delayed', 'delivered', 'packing'].includes(status);
          })
      : [];

    return filterOrders.filter((order) => {
      const matchesSearch = search
        ? [order.customer, order.email, order.snack].some((field) => {
            return field.toLowerCase().includes(search);
          })
        : true;
      const matchesStatus =
        selectedStatuses.length > 0
          ? selectedStatuses.includes(order.status)
          : true;
      return matchesSearch && matchesStatus;
    });
  }, [values.filter, values.search]);

  return (
    <DataTable
      ariaLabel="Snack shop orders with megapixels filter"
      columns={defaultColumns}
      data={filteredOrders}
      features={{
        columnVisibility: true,
      }}
      testId="datatable-with-megapixels-filter"
      toolbarContent={
        <Filter
          className={{
            base: 'w-full',
            form: 'mb-0 flex flex-wrap items-center gap-3',
          }}
          config={{
            filters: [
              filterRegistry.checkboxes({
                name: 'status',
                config: {
                  text: 'Status',
                  options: [
                    {
                      label: renderStatusLabel('delivered'),
                      value: 'delivered',
                    },
                    {
                      label: renderStatusLabel('packing'),
                      value: 'packing',
                    },
                    {
                      label: renderStatusLabel('delayed'),
                      value: 'delayed',
                    },
                  ],
                },
              }),
            ],
            search: { placeholder: 'Search customers or snacks...' },
          }}
          disableAnimation={disableAnimation}
          onChange={(nextValues) => {
            setValues(
              nextValues as {
                filter?: Record<string, unknown>;
                search?: string;
              },
            );
          }}
          portalContainer={portalContainer}
          values={values}
        />
      }
    />
  );
};

const SnackOrderDataTable = DataTable<SnackOrder, unknown>;

const meta: Meta<typeof SnackOrderDataTable> = {
  title: 'Megapixels/DataTable',
  component: SnackOrderDataTable,
};

export default meta;
type Story = StoryObj<typeof SnackOrderDataTable>;

type PlaygroundArgs = DataTableProps<SnackOrder, unknown> & {
  enableColumnVisibility: boolean;
  enablePagination: boolean;
  enableRowSelection: boolean;
  enableSorting: boolean;
  pageSizeOptions: number[];
  searchColumns: DataTableSearchField[];
  enableSearch: boolean;
  showRowsPerPage: boolean;
};

const playgroundArgs: PlaygroundArgs = {
  ariaLabel: 'Playground European snack shop orders',
  columns: defaultColumns,
  data: playgroundOrders,
  enableColumnVisibility: true,
  enablePagination: true,
  enableRowSelection: true,
  enableSearch: true,
  enableSorting: true,
  loading: false,
  pageSizeOptions: [10, 20, 50],
  searchColumns: [{ column: 'email', placeholder: 'Find a customer email...' }],
  showRowsPerPage: true,
  testId: 'datatable-playground',
};

export const Default: Story = {
  args: {
    ariaLabel: 'European snack shop orders',
    columns: defaultColumns,
    data: defaultOrders,
    testId: 'datatable-default',
  },
};

export const Playground: Story = {
  args: playgroundArgs,
  argTypes: {
    enableColumnVisibility: { control: 'boolean' },
    enablePagination: { control: 'boolean' },
    enableRowSelection: { control: 'boolean' },
    enableSearch: { control: 'boolean' },
    enableSorting: { control: 'boolean' },
    loading: { control: 'boolean' },
    pageSizeOptions: { control: 'object' },
    searchColumns: { control: 'object' },
    showRowsPerPage: { control: 'boolean' },
  } as Story['argTypes'],
  render: (storyArgs) => {
    const {
      enableColumnVisibility,
      enablePagination,
      enableRowSelection,
      enableSearch,
      enableSorting,
      pageSizeOptions,
      searchColumns,
      showRowsPerPage,
      ...args
    } = storyArgs as PlaygroundArgs;

    return (
      <SnackOrderDataTable
        {...args}
        columns={enableSorting ? sortableColumns : defaultColumns}
        features={{
          columnVisibility: enableColumnVisibility,
          pagination: enablePagination
            ? { pageSizeOptions, showRowsPerPage }
            : false,
          rowSelection: enableRowSelection,
          search: enableSearch ? { columns: searchColumns } : undefined,
        }}
      />
    );
  },
};

export const SortableAndSearchable: Story = {
  args: {
    ariaLabel: 'Sortable European snack shop orders',
    columns: sortableColumns,
    data: searchOrders,
    features: {
      search: {
        columns: [
          { column: 'email', placeholder: 'Search by customer email...' },
        ],
      },
    },
    testId: 'datatable-sort-search',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Sorting the customer column ascending puts "Greta Fischer" first.
    await userEvent.click(canvas.getByRole('button', { name: /Customer/ }));
    const rows = canvas.getAllByRole('row');
    // rows[0] is the header row, rows[1] is the first data row.
    await expect(
      within(rows[1]).getByText('Greta Fischer'),
    ).toBeInTheDocument();

    // The built-in search input narrows rows by the configured email column.
    await userEvent.type(
      canvas.getByPlaceholderText('Search by customer email...'),
      'marc',
    );
    await expect(canvas.getByText('Marc Lefèvre')).toBeInTheDocument();
    await expect(canvas.queryByText('Greta Fischer')).not.toBeInTheDocument();
  },
};

export const WithMegapixelsFilter: Story = {
  render: (_args, { canvasElement }) => {
    // Portal the Filter's menu/modal into the story root so snapshots stay
    // deterministic and portals are cleaned up with the story.
    return (
      <DataTableWithMegapixelsFilter
        disableAnimation={isTestEnv}
        portalContainer={canvasElement}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Add the "Status" filter and narrow the table to delivered orders.
    await userEvent.click(canvas.getByTestId('add_filter_button'));
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: /Status/ }),
    );
    await userEvent.click(
      await canvas.findByRole('checkbox', { name: /Delivered/ }),
    );
    await userEvent.click(canvas.getByTestId('apply_filter_button'));

    // Wait for the modal to fully unmount so the snapshot is deterministic
    // (otherwise it can capture the closing exit animation).
    await waitFor(async () => {
      return expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Packing/delayed orders drop out, delivered ones remain.
    await waitFor(async () => {
      return expect(canvas.queryByText('Marc Lefèvre')).not.toBeInTheDocument();
    });
    await expect(canvas.getByText('Lena Weber')).toBeInTheDocument();
    await expect(canvas.getByText('Greta Fischer')).toBeInTheDocument();
  },
};

export const RowSelection: Story = {
  args: {
    ariaLabel: 'Selectable European snack shop orders',
    columns: defaultColumns,
    data: compactOrders,
    features: {
      pagination: { showRowsPerPage: false },
      rowSelection: true,
    },
    testId: 'datatable-selection',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText(/row\(s\) selected/i),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByLabelText('Select row 0'));
    await expect(
      canvas.getByText('1 of 2 row(s) selected.'),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    ariaLabel: 'Loading European snack shop orders',
    columns: defaultColumns,
    data: [],
    features: { rowSelection: false },
    loading: true,
    loadingContent: 'Preheating the tiny bakery oven...',
    testId: 'datatable-loading',
  },
};

export const Empty: Story = {
  args: {
    ariaLabel: 'Custom empty European snack shop orders',
    columns: defaultColumns,
    data: [],
    emptyContent: (
      <div className="flex flex-col items-center justify-center gap-2 py-6">
        <span aria-hidden="true" className="text-4xl">
          🥐
        </span>
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            The pastry tray is empty.
          </p>
          <p className="text-sm text-default-500">
            Someone probably took the last croissant to the canal.
          </p>
        </div>
      </div>
    ),
    features: { rowSelection: false },
    testId: 'datatable-custom-empty',
  },
};

export const CustomStyles: Story = {
  args: {
    ariaLabel: 'Styled European snack shop orders',
    columns: defaultColumns,
    data: styledOrders,
    features: {
      columnVisibility: true,
      search: {
        columns: [
          { column: 'email', placeholder: 'Search snack customers...' },
        ],
      },
      pagination: { pageSizeOptions: [3, 6, 9] },
      rowSelection: true,
    },
    className: {
      base: [
        'overflow-hidden rounded-2xl p-[2px]',
        'bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-300 shadow-[0_8px_30px_rgb(0,0,0,0.05)]',
        'dark:bg-gradient-to-br dark:from-fuchsia-500 dark:via-purple-500 dark:to-amber-400/70 dark:shadow-[0_0_40px_2px_rgba(217,70,239,0.15)]',
      ],
      checkbox:
        'border-fuchsia-400/50 bg-fuchsia-50/70 text-fuchsia-700 dark:border-fuchsia-400/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200',
      checkboxIndicator:
        'text-[10px] leading-none text-fuchsia-700 dark:text-fuchsia-200',
      searchInput:
        'h-10 rounded-full border-2 border-fuchsia-400 bg-gradient-to-r from-fuchsia-100 via-rose-100 to-amber-100 px-4 text-fuchsia-700 placeholder:text-fuchsia-400/70 hover:border-amber-400 data-[focused=true]:border-amber-400 dark:border-fuchsia-500/40 dark:from-fuchsia-900 dark:via-rose-900 dark:to-amber-900 dark:text-fuchsia-200 dark:placeholder:text-fuchsia-500/60',
      pageSizeLabel:
        'flex items-center gap-2 text-sm text-fuchsia-700 dark:text-fuchsia-200',
      pageSizeSelect:
        'min-w-16 justify-between gap-2 rounded-full border-fuchsia-300/60 bg-rose-50/60 text-fuchsia-700 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200',
      pageSummary: 'text-sm text-fuchsia-700 dark:text-fuchsia-200',
      paginationButton:
        'rounded-full border-fuchsia-300/60 bg-rose-50/60 text-fuchsia-700 hover:bg-rose-100/70 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/20',
      pagination:
        'flex items-center gap-2 rounded-b-2xl bg-gradient-to-r from-rose-100 via-fuchsia-100 to-amber-100 px-4 py-4 dark:bg-gradient-to-br dark:from-[#2a0a4a] dark:via-[#12183e] dark:to-[#0a1024]',
      selectionSummary:
        'mr-auto text-sm text-fuchsia-700 dark:text-fuchsia-200',
      sortButton:
        '-ml-2 min-w-0 justify-start gap-1.5 rounded-full px-2 text-left font-medium text-fuchsia-900 data-[sortable=true]:cursor-pointer dark:text-fuchsia-100',
      sortIcon:
        'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-fuchsia-500 dark:text-fuchsia-300',
      tableWrapper:
        'overflow-hidden bg-white/70 backdrop-blur-xl dark:bg-slate-950/60 rounded-none',
      td: 'p-3 align-middle text-fuchsia-950 dark:text-fuchsia-50',
      th: 'h-10 px-3 text-left align-middle font-medium text-fuchsia-900 dark:text-fuchsia-100',
      thead:
        'bg-gradient-to-r from-fuchsia-100 via-rose-100 to-amber-100 dark:from-fuchsia-500/20 dark:via-purple-500/20 dark:to-amber-400/20',
      toolbar:
        'flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-rose-100 via-fuchsia-100 to-amber-100 p-4 dark:bg-gradient-to-br dark:from-[#2a0a4a] dark:via-[#12183e] dark:to-[#0a1024]',
      tr: 'border-b border-rose-300/30 last:border-b-0 data-[state=selected]:bg-fuchsia-100/60 dark:border-fuchsia-400/20 dark:data-[state=selected]:bg-fuchsia-900/40',
      viewOptionsItem:
        'flex cursor-pointer items-center rounded px-2 py-1 text-sm text-fuchsia-700 outline-none data-highlighted:bg-rose-100/60 dark:text-fuchsia-200 dark:data-highlighted:bg-fuchsia-500/10',
      viewOptionsTrigger:
        'ml-auto gap-2 rounded-full border-2 border-rose-300/60 bg-rose-50/60 text-rose-700 hover:bg-rose-100/70 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/20',
    },
    testId: 'datatable-custom',
  },
};

export const CustomIcons: Story = {
  args: {
    ariaLabel: 'European snack shop orders with emoji controls',
    columns: sortableColumns,
    data: iconOrders,
    features: {
      columnVisibility: true,
      search: {
        columns: [{ column: 'email', placeholder: 'Search customer email...' }],
      },
      pagination: true,
      rowSelection: true,
    },
    icons: {
      columnVisibility: {
        trigger: <span aria-hidden="true">🧭</span>,
        visible: <span aria-hidden="true">👁️</span>,
      },
      selection: {
        checked: <span aria-hidden="true">✅</span>,
        indeterminate: <span aria-hidden="true">➖</span>,
      },
      sort: {
        asc: <span aria-hidden="true">⬆️</span>,
        desc: <span aria-hidden="true">⬇️</span>,
        unsorted: <span aria-hidden="true">↕️</span>,
      },
    },
    testId: 'datatable-custom-icons',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Injected emoji icons replace the defaults for the trigger and sort state.
    await expect(canvas.getByText('🧭')).toBeInTheDocument();
    await expect(canvas.getAllByText('↕️').length).toBeGreaterThan(0);
  },
};
