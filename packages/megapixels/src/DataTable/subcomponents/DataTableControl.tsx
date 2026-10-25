import type { SortingState } from '@tanstack/react-table';
import type {
  DataTableProps,
  DataTableVirtualizationFeature,
} from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import { useCallback, useMemo, useRef } from 'react';

import { useDataTableController } from '../hooks/useDataTableController';
import DataTablePagination from './DataTablePagination';
import DataTableSurface from './DataTableSurface';
import DataTableToolbar from './DataTableToolbar';

interface DataTableControlProps<TData, TValue> extends Omit<
  DataTableProps<TData, TValue>,
  'className'
> {
  /** Resolved CSS classes for the component slots */
  className: DataTableClassNames;
}

/** Table feature state and composition of toolbar, rows and pagination */
const DataTableControl = <TData, TValue>({
  ariaLabel = 'Data table',
  className: classNames,
  columns,
  data,
  emptyContent = 'No results.',
  features = undefined,
  icons = undefined,
  loading = false,
  loadingContent = 'Loading...',
  testId = undefined,
  toolbarContent = undefined,
}: DataTableControlProps<TData, TValue>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const resolvedEnableColumnVisibility = features?.columnVisibility ?? false;

  // expansion can supply detail content, nested rows or both
  const resolvedExpandableRows = features?.expandableRows;
  const resolvedEnableExpandableRows = Boolean(resolvedExpandableRows);

  const paginationConfig =
    typeof features?.pagination === 'object' ? features.pagination : undefined;

  const resolvedInfiniteScroll = features?.infiniteScroll;
  const resolvedVirtualization = features?.virtualization;
  const resolvedEnableVirtualization = Boolean(
    resolvedVirtualization ?? resolvedInfiniteScroll,
  );

  // infinite scrolling owns paging and suppresses client-side row selection
  const resolvedEnablePagination = Boolean(
    features?.pagination && !resolvedInfiniteScroll,
  );
  const resolvedEnableRowSelection = Boolean(
    features?.rowSelection && !resolvedInfiniteScroll,
  );

  const resolvedPageSizeOptions = paginationConfig?.pageSizeOptions ?? [
    10, 20, 50,
  ];
  const resolvedShowRowsPerPage = paginationConfig?.showRowsPerPage ?? true;

  const resolvedSearchFields = features?.search?.columns ?? [];
  const virtualConfig: DataTableVirtualizationFeature | undefined =
    resolvedVirtualization ??
    (resolvedInfiniteScroll
      ? {
          dynamicRowHeight: true,
          maxHeight: 600,
        }
      : undefined);

  // reset the viewport before requesting a new server-side sort
  const handleSortingChange = useCallback(
    (sorting: SortingState) => {
      if (resolvedInfiniteScroll) {
        scrollContainerRef.current?.scrollTo({
          top: 0,
        });
      }
      resolvedInfiniteScroll?.onSortingChange?.(sorting);
    },
    [resolvedInfiniteScroll],
  );

  // stable object identity so the controller's selection-column memo holds
  const checkboxClassNames = useMemo(() => {
    return {
      checkbox: classNames.checkbox,
      checkboxIndicator: classNames.checkboxIndicator,
    };
  }, [classNames.checkbox, classNames.checkboxIndicator]);

  // same stability requirement as selection: the controller memoizes injected
  // columns and should only recreate them when relevant slot classes change
  const expansionClassNames = useMemo(() => {
    return {
      expandButton: classNames.expandButton,
      expandIcon: classNames.expandIcon,
    };
  }, [classNames.expandButton, classNames.expandIcon]);

  // centralized TanStack state/control lives in the controller hook
  const { table } = useDataTableController<TData, TValue>({
    checkboxClassNames,
    columns,
    data,
    enableExpandableRows: resolvedEnableExpandableRows,
    enablePagination: resolvedEnablePagination,
    enableRowSelection: resolvedEnableRowSelection,
    enableServerMode: Boolean(resolvedInfiniteScroll),
    expansionClassNames,
    expansionIcons: icons?.expandableRows,
    getSubRows: resolvedExpandableRows?.getSubRows,
    hasExpandableRowContent: Boolean(resolvedExpandableRows?.renderContent),
    onSortingChange: handleSortingChange,
    pageSizeOptions: resolvedPageSizeOptions,
    selectionIcons: icons?.selection,
  });

  return (
    <div
      className={classNames.base}
      data-component="data-table"
      data-slot="base"
      data-testid={testId}
    >
      {/* search, custom actions and column visibility */}
      <DataTableToolbar
        className={classNames}
        columnVisibility={resolvedEnableColumnVisibility}
        icons={icons}
        infiniteScroll={resolvedInfiniteScroll}
        scrollContainerRef={scrollContainerRef}
        searchFields={resolvedSearchFields}
        table={table}
        testId={testId}
        toolbarContent={toolbarContent}
      />

      {/* Switch between virtualized and standard table markup at one boundary. */}
      <div className={classNames.tableWrapper} data-slot="table-wrapper">
        <DataTableSurface
          ariaLabel={ariaLabel}
          className={classNames}
          emptyContent={emptyContent}
          expandableRows={resolvedExpandableRows}
          icons={icons}
          infiniteScroll={resolvedInfiniteScroll}
          loading={loading}
          loadingContent={loadingContent}
          scrollContainerRef={scrollContainerRef}
          table={table}
          virtualization={virtualConfig}
          virtualized={resolvedEnableVirtualization}
        />
      </div>

      {/* Footer pagination controls are feature-gated. */}
      {resolvedEnablePagination ? (
        <DataTablePagination
          className={{
            pageSizeLabel: classNames.pageSizeLabel,
            pageSizeSelect: classNames.pageSizeSelect,
            pageSummary: classNames.pageSummary,
            pagination: classNames.pagination,
            paginationButton: classNames.paginationButton,
            selectionSummary: classNames.selectionSummary,
          }}
          pageSizeOptions={resolvedPageSizeOptions}
          showRowsPerPage={resolvedShowRowsPerPage}
          showSelectionSummary={resolvedEnableRowSelection}
          table={table}
          testId={testId}
        />
      ) : null}
    </div>
  );
};

export default DataTableControl;
