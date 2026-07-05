import type { Cell, Header } from '@tanstack/react-table';
import type { CSSProperties } from 'react';
import type { DataTableIcons } from '../DataTable';

import { flexRender } from '@tanstack/react-table';

import { cn } from '@fuf-stack/pixel-utils';
import Button from '@fuf-stack/pixels/Button';

import {
  EXPANSION_COLUMN_ID,
  getSortIndicator,
  SELECTION_COLUMN_ID,
} from '../hooks/useDataTableController';

/**
 * Slot class contract shared by all table row/cell subcomponents.
 *
 * Keeping this in one place ensures header/body/virtual renderers consume the
 * same slot names and avoids optional class drift between files.
 */
export interface DataTableClassNames {
  /** Empty-state table cell class. */
  emptyCell?: string;
  /** Expanded-content table cell class. */
  expandedCell?: string;
  /** Expanded-content row class. */
  expandedRow?: string;
  /** Selection/expansion control cell class. */
  expansionCell?: string;
  /** Inner wrapper for expansion control content. */
  expansionCellContent?: string;
  /** Load-more / retry cell class in virtual mode. */
  loadingMoreCell?: string;
  /** Initial loading-state cell class. */
  loadingCell?: string;
  /** Wrapper for non-sortable header content. */
  nonSortableHeaderContent?: string;
  /** Placeholder cell class for total-count virtual mode. */
  placeholderCell?: string;
  /** Scroll container class for virtualized body. */
  scrollContainer?: string;
  /** Selection control cell class. */
  selectionCell?: string;
  /** Inner wrapper for selection control content. */
  selectionCellContent?: string;
  /** Sort button class in sortable headers. */
  sortButton?: string;
  /** Sort direction icon wrapper class. */
  sortIcon?: string;
  /** Standard table data cell class. */
  td?: string;
  /** Standard table header cell class. */
  th?: string;
  /** Standard table row class. */
  tr?: string;
}

export type DataTableColumnKind = 'data' | 'expansion' | 'selection';

// DataTable injects control columns; classify once for slot/style branching.
export const getColumnKind = (columnId: string): DataTableColumnKind => {
  if (columnId === EXPANSION_COLUMN_ID) {
    return 'expansion';
  }
  if (columnId === SELECTION_COLUMN_ID) {
    return 'selection';
  }
  return 'data';
};

export const getCellDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell';
  }
  if (columnKind === 'selection') {
    return 'selection-cell';
  }
  return 'td';
};

// Header slots mirror body slots for control columns and use `th` for data columns.
export const getHeaderDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'data') {
    return 'th';
  }
  return getCellDataSlot(columnKind);
};

// Selection/expansion controls use distinct inner wrappers for styling hooks.
export const getControlCellContentDataSlot = (
  columnKind: DataTableColumnKind,
) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell-content';
  }
  return 'selection-cell-content';
};

/**
 * Flex sizing for cells in virtualized mode.
 *
 * Because virtual rows are absolutely positioned, we cannot rely on native
 * table layout for column width sync; header/body cells must apply matching
 * explicit sizing rules.
 */
export const getVirtualCellStyle = (
  columnKind: DataTableColumnKind,
  size: number,
): CSSProperties => {
  if (columnKind === 'data') {
    return { flex: `1 1 ${size}px`, minWidth: 0, width: size };
  }
  return { flex: `0 0 ${size}px`, width: size };
};

/** Shared row positioning style for full-width virtual rows. */
export const virtualFullWidthRowStyle = (start: number): CSSProperties => {
  return {
    display: 'flex',
    position: 'absolute',
    transform: `translateY(${start}px)`,
    width: '100%',
  };
};

/** Shared single-cell style for full-width virtual rows. */
export const virtualFullWidthCellStyle: CSSProperties = {
  flex: '1 1 auto',
  width: '100%',
};

interface DataTableHeaderCellProps<TData, TValue> {
  /** Slot classes resolved by `dataTableVariants`. */
  classNames: DataTableClassNames;
  /** TanStack header instance for this column. */
  header: Header<TData, TValue>;
  /** Optional custom sort icons (asc/desc/unsorted). */
  sortIcons?: DataTableIcons['sort'];
  /** Enables flex sizing for virtualized header layout. */
  virtualized?: boolean;
}

/**
 * Renders one header cell and encapsulates sortable/non-sortable behavior.
 */
export const DataTableHeaderCell = <TData, TValue>({
  classNames,
  header,
  sortIcons = undefined,
  virtualized = false,
}: DataTableHeaderCellProps<TData, TValue>) => {
  // Sorting UI is only rendered when the column opts into sorting.
  const canSort = header.column.getCanSort();
  const columnKind = getColumnKind(header.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const sortState = header.column.getIsSorted();
  const sortIndicator = getSortIndicator(canSort, sortState, sortIcons);

  if (header.isPlaceholder) {
    // TanStack placeholder header used to preserve grouped-header alignment.
    return (
      <th
        key={header.id}
        aria-label="Empty column header"
        className={classNames.th}
        data-slot={getHeaderDataSlot(columnKind)}
      />
    );
  }

  return (
    <th
      key={header.id}
      className={cn(
        classNames.th,
        isExpansionColumn && classNames.expansionCell,
        isSelectionColumn && classNames.selectionCell,
      )}
      data-slot={getHeaderDataSlot(columnKind)}
      style={
        virtualized
          ? {
              alignItems: 'center',
              display: 'flex',
              ...getVirtualCellStyle(columnKind, header.getSize()),
            }
          : undefined
      }
    >
      {canSort ? (
        <Button
          className={classNames.sortButton}
          data-sortable={canSort}
          dataSlot="sort-button"
          onClick={() => {
            header.column.toggleSorting(sortState === 'asc');
          }}
          size="sm"
          variant="light"
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {sortIndicator ? (
            <span
              aria-hidden="true"
              className={classNames.sortIcon}
              data-slot="sort-icon"
            >
              {sortIndicator}
            </span>
          ) : null}
        </Button>
      ) : (
        <div
          className={cn(
            classNames.nonSortableHeaderContent,
            isExpansionColumn && classNames.expansionCellContent,
            isSelectionColumn && classNames.selectionCellContent,
          )}
          data-slot={
            columnKind === 'data'
              ? 'non-sortable-header-content'
              : getControlCellContentDataSlot(columnKind)
          }
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      )}
    </th>
  );
};

interface DataTableBodyCellProps<TData> {
  /** TanStack body cell instance to render. */
  cell: Cell<TData, unknown>;
  /** Slot classes resolved by `dataTableVariants`. */
  classNames: DataTableClassNames;
  /** Enables flex sizing for virtualized row layout. */
  virtualized?: boolean;
}

/**
 * Renders one body cell and hides control-column wrapper details from row loops.
 */
export const DataTableBodyCell = <TData,>({
  cell,
  classNames,
  virtualized = false,
}: DataTableBodyCellProps<TData>) => {
  const columnKind = getColumnKind(cell.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const isControlColumn = columnKind !== 'data';
  const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
  // Nested rows are visually indented only in the expansion control column.
  const expansionIndent =
    isExpansionColumn && cell.row.depth > 0
      ? { paddingLeft: `${cell.row.depth * 1.25}rem` }
      : undefined;

  return (
    <td
      key={cell.id}
      className={cn(
        classNames.td,
        isExpansionColumn && classNames.expansionCell,
        isSelectionColumn && classNames.selectionCell,
      )}
      data-slot={getCellDataSlot(columnKind)}
      style={
        virtualized
          ? getVirtualCellStyle(columnKind, cell.column.getSize())
          : undefined
      }
    >
      {isControlColumn ? (
        <div
          className={cn(
            isExpansionColumn && classNames.expansionCellContent,
            isSelectionColumn && classNames.selectionCellContent,
          )}
          data-slot={getControlCellContentDataSlot(columnKind)}
          style={expansionIndent}
        >
          {cellContent}
        </div>
      ) : (
        cellContent
      )}
    </td>
  );
};
