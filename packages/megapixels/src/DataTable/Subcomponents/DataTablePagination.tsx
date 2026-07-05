import type { Table } from '@tanstack/react-table';

import { Button } from '@fuf-stack/pixels/Button';
import { Menu } from '@fuf-stack/pixels/Menu';

interface PaginationClassNames {
  pageSizeLabel?: string;
  pageSizeSelect?: string;
  pagination?: string;
  paginationButton?: string;
  pageSummary?: string;
  selectionSummary?: string;
}

const ChevronDownIcon = () => {
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
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
};

export interface DataTablePaginationProps<TData> {
  /** Slot-driven class names forwarded from DataTable variants. */
  classNames: PaginationClassNames;
  /** Available rows-per-page options. */
  pageSizeOptions: number[];
  /** Shows the rows-per-page selector when pagination is enabled. */
  showRowsPerPage: boolean;
  /** Shows selected-row summary when row selection is enabled. */
  showSelectionSummary: boolean;
  /** TanStack table instance used for paging and counts. */
  table: Table<TData>;
  /** Optional test id prefix used for control ids. */
  testId?: string;
}

/** Footer controls for paging, page size, and selected-row summary. */
const DataTablePagination = <TData,>({
  classNames,
  pageSizeOptions,
  showRowsPerPage,
  showSelectionSummary,
  table,
  testId = undefined,
}: DataTablePaginationProps<TData>) => {
  const { pageSize } = table.getState().pagination;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const pageSizeItems = pageSizeOptions.map((size) => {
    return {
      key: String(size),
      textValue: String(size),
      label: (
        <span className="flex items-center gap-2">
          <span className="inline-flex w-3 justify-center">
            {size === pageSize ? '✓' : ''}
          </span>
          {size}
        </span>
      ),
    };
  });

  return (
    <div className={classNames.pagination} data-slot="pagination">
      {showSelectionSummary && selectedRowCount > 0 ? (
        <div
          className={classNames.selectionSummary}
          data-slot="selection-summary"
        >
          {selectedRowCount} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={classNames.selectionSummary}
          data-slot="selection-summary"
        />
      )}

      {showRowsPerPage && pageSizeOptions.length > 0 ? (
        <div className={classNames.pageSizeLabel} data-slot="page-size-label">
          <span>Rows per page</span>
          <Menu
            ariaLabel="Rows per page"
            items={pageSizeItems}
            onAction={(key) => {
              // Keep page-size source of truth inside TanStack state.
              table.setPageSize(Number(key));
            }}
            placement="top"
            testId={testId ? `${testId}-page-size` : undefined}
            triggerButtonProps={{
              'aria-label': 'Rows per page',
              className: classNames.pageSizeSelect,
              dataSlot: 'page-size-select',
              disableRipple: true,
              size: 'sm',
              variant: 'bordered',
            }}
          >
            {pageSize}
            <ChevronDownIcon />
          </Menu>
        </div>
      ) : null}

      <div className={classNames.pageSummary} data-slot="page-summary">
        Page {table.getState().pagination.pageIndex + 1} of{' '}
        {Math.max(table.getPageCount(), 1)}
      </div>

      <Button
        className={classNames.paginationButton}
        dataSlot="pagination-button"
        disabled={!table.getCanPreviousPage()}
        onClick={() => {
          table.previousPage();
        }}
        size="sm"
        testId={testId ? `${testId}-previous-page` : undefined}
        variant="bordered"
      >
        Previous
      </Button>
      <Button
        className={classNames.paginationButton}
        dataSlot="pagination-button"
        disabled={!table.getCanNextPage()}
        onClick={() => {
          table.nextPage();
        }}
        size="sm"
        testId={testId ? `${testId}-next-page` : undefined}
        variant="bordered"
      >
        Next
      </Button>
    </div>
  );
};

export default DataTablePagination;
