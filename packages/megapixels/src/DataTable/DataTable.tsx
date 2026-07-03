import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { useMemo } from 'react';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useDataTableController } from './hooks/useDataTableController';
import DataTablePagination from './Subcomponents/DataTablePagination';
import {
  DataTableBodyRows,
  DataTableHeaderCell,
} from './Subcomponents/DataTableRows';
import DataTableViewOptions from './Subcomponents/DataTableViewOptions';

export const dataTableVariants = tv({
  slots: {
    // Root wrapper around toolbar, table, and pagination.
    base: 'w-full',
    // Selection checkbox control in header/rows.
    checkbox:
      'relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border border-divider bg-background align-middle text-foreground',
    // Checkmark/minus glyph inside the selection checkbox.
    checkboxIndicator:
      'pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] leading-none',
    // Empty-state cell shown when no rows match.
    emptyCell: 'h-24 text-center text-default-500',
    // Button used by the injected expandable-row toggle column.
    expandButton:
      'h-8 min-w-8 px-0 disabled:cursor-not-allowed data-[disabled=true]:pointer-events-auto data-[disabled=true]:cursor-not-allowed',
    // Icon wrapper inside the expandable-row toggle button.
    expandIcon:
      'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-default-500',
    // Header/body cell reserved for the expandable-row toggle column.
    expansionCell: 'w-10 px-0 text-center',
    // Inner wrapper that visually centers expandable-row toggle buttons.
    expansionCellContent: 'flex justify-center',
    // Table row rendered directly below an expanded data row.
    expandedRow: 'bg-content1',
    // Table cell that spans all visible columns for expanded content.
    expandedCell: 'p-4 text-sm text-default-600',
    // Built-in text search input(s) rendered in the toolbar.
    searchInput:
      'h-10 w-full max-w-sm rounded-small border-2 border-default-200 bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-default-500 hover:border-default-400 data-[focused=true]:border-focus dark:border-default-100',
    // Loading-state cell shown while data is being fetched.
    loadingCell: 'h-24 text-center text-default-500',
    // Plain header content used for non-sortable columns.
    nonSortableHeaderContent: 'inline-flex items-center',
    // Label wrapping the "Rows per page" selector.
    pageSizeLabel: 'flex items-center gap-2 text-sm text-default-500',
    // Menu trigger used to choose page size.
    pageSizeSelect: 'min-w-16 justify-between gap-2',
    // "Page X of Y" summary text.
    pageSummary: 'text-sm text-default-500',
    // Pagination footer container.
    pagination: 'flex items-center gap-2 py-4',
    // Shared class applied to pagination action buttons.
    paginationButton: '',
    // Selected rows summary text in pagination footer.
    selectionSummary: 'mr-auto text-sm text-default-500',
    // Header/body cell reserved for the selection checkbox column.
    selectionCell: 'w-10 px-0 text-center',
    // Inner wrapper that visually centers selection checkboxes in their cells.
    selectionCellContent: 'flex justify-center',
    // Header button used for sortable columns.
    sortButton:
      '-ml-2 min-w-0 justify-start gap-1.5 px-2 text-left font-medium text-foreground data-[sortable=true]:cursor-pointer',
    // Icon wrapper for sort direction indicators.
    sortIcon:
      'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-default-400',
    // Semantic table element.
    table: 'w-full caption-bottom text-sm',
    // Border/overflow container around the table.
    tableWrapper: 'overflow-hidden rounded-md border border-divider',
    // Semantic table body wrapper.
    tbody: '',
    // Standard table data cell.
    td: 'p-3 align-middle text-foreground',
    // Standard table header cell.
    th: 'h-10 px-3 text-left align-middle font-medium text-foreground',
    // Table header row group background.
    thead: 'bg-content2',
    // Toolbar container for filters/actions.
    toolbar: 'flex items-center gap-3 py-4',
    // Optional custom toolbar content area.
    toolbarContent: 'flex flex-1 items-center',
    // Table row styling including selected-row state.
    tr: 'border-b border-divider last:border-b-0 data-[state=selected]:bg-content2/60',
    // Checkmark indicator area inside view options menu items.
    viewOptionsIndicator: 'mr-2 inline-flex w-3 justify-center',
    // Individual view-options menu item.
    viewOptionsItem:
      'data-highlighted:bg-default-100 dark:data-highlighted:bg-default-100/20 flex cursor-pointer items-center rounded px-2 py-1 text-sm text-foreground outline-none',
    // Dropdown menu panel for view options.
    viewOptionsMenu:
      'z-50 min-w-40 rounded-md border border-divider bg-background p-1 shadow-md',
    // Positioner wrapper used by menu popover.
    viewOptionsPositioner: 'outline-none',
    // Trigger button for the "Columns" menu.
    viewOptionsTrigger: 'ml-auto gap-2',
  },
});

type ClassName = TVClassName<typeof dataTableVariants>;

export interface DataTableSearchField {
  /** Column id used by the built-in text search input. */
  column: string;
  /** Placeholder text for this search input. */
  placeholder?: string;
}

export interface DataTableIcons {
  /** Icons used by expandable row controls. */
  expandableRows?: {
    /** Icon for collapsed rows; pass `false` to hide. */
    collapsed?: ReactNode | false;
    /** Icon for expanded rows; pass `false` to hide. */
    expanded?: ReactNode | false;
  };
  /** Icons used for sorting indicators. */
  sort?: {
    /** Icon for ascending sort; pass `false` to hide. */
    asc?: ReactNode | false;
    /** Icon for descending sort; pass `false` to hide. */
    desc?: ReactNode | false;
    /** Icon for sortable-but-unsorted state; pass `false` to hide. */
    unsorted?: ReactNode | false;
  };
  /** Icons used by row-selection checkboxes. */
  selection?: {
    /** Icon for checked state; pass `false` to hide. */
    checked?: ReactNode | false;
    /** Icon for indeterminate state; pass `false` to hide. */
    indeterminate?: ReactNode | false;
  };
  /** Icons used by column visibility controls. */
  columnVisibility?: {
    /** Icon shown in the column visibility trigger; pass `false` to hide. */
    trigger?: ReactNode | false;
    /** Icon for visible columns in the menu; pass `false` to hide. */
    visible?: ReactNode | false;
  };
}

export interface DataTableExpandableRowsFeature<TData = unknown> {
  /**
   * Returns nested child rows for TanStack-style hierarchical expansion.
   * Provide this when your data contains multi-level rows (for example
   * `row.children` or `row.subRows`).
   */
  getSubRows?: (originalRow: TData, index: number) => TData[] | undefined;
  /** Content rendered in a full-width row below an expanded table row. */
  renderContent?: (row: Row<TData>) => ReactNode;
}

export interface DataTableFeatures<TData = unknown> {
  /** Enables TanStack expanding for detail panels, nested sub rows, or both. */
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  /** Enables the "Columns" menu for toggling visible columns. */
  columnVisibility?: boolean;
  /** Enables pagination row model and footer controls, optionally with page-size settings. */
  pagination?: boolean | DataTablePaginationFeature;
  /** Enables row selection and select-all checkbox column. */
  rowSelection?: boolean;
  /** Configuration for built-in text search inputs. */
  search?: {
    /** Built-in search inputs keyed by TanStack column id. */
    columns?: DataTableSearchField[];
  };
}

export interface DataTablePaginationFeature {
  /** Available page-size options. The first value becomes the initial page size. */
  pageSizeOptions?: number[];
  /** Shows the "Rows per page" selector in the pagination footer. */
  showRowsPerPage?: boolean;
}

export interface DataTableProps<TData, TValue> {
  /** Accessible label for the underlying HTML table. */
  ariaLabel?: string;
  /** Slot-based class overrides generated from `dataTableVariants`. */
  className?: ClassName;
  /** TanStack column definitions used to render headers/cells. */
  columns: ColumnDef<TData, TValue>[];
  /** Row data rendered by the table. */
  data: TData[];
  /** Content shown when no rows match current table state. */
  emptyContent?: ReactNode;
  /** Grouped feature switches/configuration. */
  features?: DataTableFeatures<TData>;
  /** Optional icon overrides for all built-in DataTable icons. */
  icons?: DataTableIcons;
  /** Shows loading row instead of regular row output. */
  loading?: boolean;
  /** Content displayed inside the loading row. */
  loadingContent?: ReactNode;
  /** Optional `data-testid` prefix used for table controls. */
  testId?: string;
  /** Optional custom content rendered in the table toolbar area. */
  toolbarContent?: ReactNode;
}

/**
 * Generic, feature-composable data table built on TanStack Table.
 *
 * Responsibilities:
 * - Renders semantic table markup (`table`, `thead`, `tbody`, `tr`, `th`, `td`).
 * - Wires sorting/search/visibility/selection/pagination state via
 *   `useDataTableController`.
 * - Exposes slot-based styling through `dataTableVariants` + `className`.
 * - Supports optional custom toolbar content (e.g. megapixels `Filter`).
 *
 * Feature configuration:
 * - Configure search/visibility/selection/pagination through `features`.
 */
const DataTable = <TData, TValue>({
  ariaLabel = 'Data table',
  className = undefined,
  columns,
  data,
  emptyContent = 'No results.',
  features = undefined,
  icons = undefined,
  loading = false,
  loadingContent = 'Loading...',
  testId = undefined,
  toolbarContent = undefined,
}: DataTableProps<TData, TValue>) => {
  const resolvedEnableColumnVisibility = features?.columnVisibility ?? false;
  // Expandable rows need configuration (detail renderer, nested row getter, or
  // both), so this feature is an object rather than a boolean flag.
  const resolvedExpandableRows = features?.expandableRows;
  const resolvedEnableExpandableRows = Boolean(resolvedExpandableRows);
  const paginationConfig =
    typeof features?.pagination === 'object' ? features.pagination : undefined;
  const resolvedEnablePagination = Boolean(features?.pagination);
  const resolvedEnableRowSelection = features?.rowSelection ?? false;
  const resolvedPageSizeOptions = paginationConfig?.pageSizeOptions ?? [
    10, 20, 50,
  ];
  const resolvedShowRowsPerPage = paginationConfig?.showRowsPerPage ?? true;

  const resolvedSearchFields = features?.search?.columns ?? [];

  const variants = dataTableVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  // Stable object identity so the controller's selection-column memo holds.
  const checkboxClassNames = useMemo(() => {
    return {
      checkbox: classNames.checkbox,
      checkboxIndicator: classNames.checkboxIndicator,
    };
  }, [classNames.checkbox, classNames.checkboxIndicator]);

  // Same stability requirement as selection: the controller memoizes injected
  // columns and should only recreate them when relevant slot classes change.
  const expansionClassNames = useMemo(() => {
    return {
      expandButton: classNames.expandButton,
      expandIcon: classNames.expandIcon,
    };
  }, [classNames.expandButton, classNames.expandIcon]);

  // Centralized TanStack state/control lives in the controller hook.
  const { table } = useDataTableController<TData, TValue>({
    checkboxClassNames,
    columns,
    data,
    enableExpandableRows: resolvedEnableExpandableRows,
    enablePagination: resolvedEnablePagination,
    enableRowSelection: resolvedEnableRowSelection,
    expansionClassNames,
    expansionIcons: icons?.expandableRows,
    getSubRows: resolvedExpandableRows?.getSubRows,
    hasExpandableRowContent: Boolean(resolvedExpandableRows?.renderContent),
    pageSizeOptions: resolvedPageSizeOptions,
    selectionIcons: icons?.selection,
  });
  // Used by loading/empty rows and main table rendering loop.
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const tableRows = table.getRowModel().rows;

  return (
    <div className={classNames.base} data-slot="base" data-testid={testId}>
      {/* Optional toolbar area for built-in search, custom content, and column visibility controls. */}
      {resolvedSearchFields.length > 0 ||
      resolvedEnableColumnVisibility ||
      toolbarContent ? (
        <div className={classNames.toolbar} data-slot="toolbar">
          {toolbarContent ? (
            <div
              className={classNames.toolbarContent}
              data-slot="toolbar-content"
            >
              {toolbarContent}
            </div>
          ) : null}
          {resolvedSearchFields.map((searchField) => {
            const searchValue =
              (table.getColumn(searchField.column)?.getFilterValue() as
                | string
                | undefined) ?? '';
            let searchTestId: string | undefined;
            if (testId) {
              searchTestId =
                resolvedSearchFields.length === 1
                  ? `${testId}-search`
                  : `${testId}-search-${searchField.column}`;
            }
            return (
              <input
                key={searchField.column}
                className={classNames.searchInput}
                data-focused={Boolean(searchValue)}
                data-slot="search-input"
                data-testid={searchTestId}
                onChange={(event) => {
                  table
                    .getColumn(searchField.column)
                    ?.setFilterValue(event.target.value);
                }}
                placeholder={searchField.placeholder ?? 'Search...'}
                value={searchValue}
              />
            );
          })}

          {resolvedEnableColumnVisibility ? (
            <DataTableViewOptions
              classNames={{
                viewOptionsIndicator: classNames.viewOptionsIndicator,
                viewOptionsItem: classNames.viewOptionsItem,
                viewOptionsTrigger: classNames.viewOptionsTrigger,
              }}
              table={table}
              testId={testId}
              triggerIcon={icons?.columnVisibility?.trigger}
              visibleIcon={icons?.columnVisibility?.visible}
            />
          ) : null}
        </div>
      ) : null}

      <div className={classNames.tableWrapper} data-slot="table-wrapper">
        <table
          aria-label={ariaLabel}
          className={classNames.table}
          data-slot="table"
        >
          <thead className={classNames.thead} data-slot="thead">
            {/* Header groups come from TanStack and support sorting per column. */}
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <tr
                  key={headerGroup.id}
                  className={classNames.tr}
                  data-slot="tr"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <DataTableHeaderCell
                        key={header.id}
                        classNames={classNames}
                        header={header}
                        sortIcons={icons?.sort}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody className={classNames.tbody} data-slot="tbody">
            {/* Render regular rows unless loading mode is active. */}
            {loading ? null : (
              <DataTableBodyRows
                classNames={classNames}
                expandableRows={resolvedExpandableRows}
                rows={tableRows}
                visibleColumnCount={visibleColumnCount}
              />
            )}
            {/* Loading and empty states reserve full table width via visible column span. */}
            {loading ? (
              <tr className={classNames.tr} data-slot="tr">
                <td
                  className={classNames.loadingCell}
                  colSpan={visibleColumnCount}
                  data-slot="loading-cell"
                >
                  {loadingContent}
                </td>
              </tr>
            ) : null}
            {!loading && tableRows.length === 0 ? (
              <tr className={classNames.tr} data-slot="tr">
                <td
                  className={classNames.emptyCell}
                  colSpan={visibleColumnCount}
                  data-slot="empty-cell"
                >
                  {emptyContent}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Footer pagination controls are feature-gated. */}
      {resolvedEnablePagination ? (
        <DataTablePagination
          classNames={{
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

export default DataTable;
