import type { Cell, Header, Row } from '@tanstack/react-table';
import type {
  DataTableExpandableRowsFeature,
  DataTableIcons,
} from '../DataTable';

import { Fragment } from 'react';

import { flexRender } from '@tanstack/react-table';

import { cn } from '@fuf-stack/pixel-utils';
import Button from '@fuf-stack/pixels/Button';

import {
  EXPANSION_COLUMN_ID,
  getSortIndicator,
  SELECTION_COLUMN_ID,
} from '../hooks/useDataTableController';

export interface DataTableClassNames {
  emptyCell?: string;
  expandedCell?: string;
  expandedRow?: string;
  expansionCell?: string;
  expansionCellContent?: string;
  loadingCell?: string;
  nonSortableHeaderContent?: string;
  selectionCell?: string;
  selectionCellContent?: string;
  sortButton?: string;
  sortIcon?: string;
  td?: string;
  th?: string;
  tr?: string;
}

type DataTableColumnKind = 'data' | 'expansion' | 'selection';

// DataTable injects a few control columns. Classifying them once keeps the
// table markup helpers from duplicating id checks and slot decisions.
const getColumnKind = (columnId: string): DataTableColumnKind => {
  if (columnId === EXPANSION_COLUMN_ID) {
    return 'expansion';
  }
  if (columnId === SELECTION_COLUMN_ID) {
    return 'selection';
  }
  return 'data';
};

const getCellDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell';
  }
  if (columnKind === 'selection') {
    return 'selection-cell';
  }
  return 'td';
};

const getHeaderDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'data') {
    return 'th';
  }
  return getCellDataSlot(columnKind);
};

const getControlCellContentDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell-content';
  }
  return 'selection-cell-content';
};

interface DataTableHeaderCellProps<TData, TValue> {
  classNames: DataTableClassNames;
  header: Header<TData, TValue>;
  sortIcons?: DataTableIcons['sort'];
}

/**
 * Renders a single table header cell.
 *
 * Control columns (selection/expansion) are visually centered and intentionally
 * not sortable; data columns may opt into sorting through their ColumnDef.
 */
export const DataTableHeaderCell = <TData, TValue>({
  classNames,
  header,
  sortIcons = undefined,
}: DataTableHeaderCellProps<TData, TValue>) => {
  const canSort = header.column.getCanSort();
  const columnKind = getColumnKind(header.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const sortState = header.column.getIsSorted();
  const sortIndicator = getSortIndicator(canSort, sortState, sortIcons);

  if (header.isPlaceholder) {
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
  cell: Cell<TData, unknown>;
  classNames: DataTableClassNames;
}

/**
 * Renders one body cell and applies the centering wrapper used by injected
 * control columns. Keeping this in one place prevents selection/expansion
 * layout from leaking through the main table loop.
 */
const DataTableBodyCell = <TData,>({
  cell,
  classNames,
}: DataTableBodyCellProps<TData>) => {
  const columnKind = getColumnKind(cell.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const isControlColumn = columnKind !== 'data';
  const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

  return (
    <td
      key={cell.id}
      className={cn(
        classNames.td,
        isExpansionColumn && classNames.expansionCell,
        isSelectionColumn && classNames.selectionCell,
      )}
      data-slot={getCellDataSlot(columnKind)}
    >
      {isControlColumn ? (
        <div
          className={cn(
            isExpansionColumn && classNames.expansionCellContent,
            isSelectionColumn && classNames.selectionCellContent,
          )}
          data-slot={getControlCellContentDataSlot(columnKind)}
        >
          {cellContent}
        </div>
      ) : (
        cellContent
      )}
    </td>
  );
};

interface DataTableBodyRowsProps<TData> {
  classNames: DataTableClassNames;
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  rows: Row<TData>[];
  visibleColumnCount: number;
}

/** Renders data rows and their optional expanded detail row. */
export const DataTableBodyRows = <TData,>({
  classNames,
  expandableRows = undefined,
  rows,
  visibleColumnCount,
}: DataTableBodyRowsProps<TData>) => {
  return rows.map((row) => {
    return (
      <Fragment key={row.id}>
        <tr
          className={classNames.tr}
          data-slot="tr"
          data-state={row.getIsSelected() ? 'selected' : undefined}
        >
          {row.getVisibleCells().map((cell) => {
            return (
              <DataTableBodyCell
                key={cell.id}
                cell={cell}
                classNames={classNames}
              />
            );
          })}
        </tr>
        {/*
          Expanded content is a sibling <tr> so it can span all currently
          visible columns without coupling detail markup to every cell.
        */}
        {expandableRows && row.getIsExpanded() ? (
          <tr
            className={cn(classNames.tr, classNames.expandedRow)}
            data-slot="expanded-row"
          >
            <td
              className={classNames.expandedCell}
              colSpan={visibleColumnCount}
              data-slot="expanded-cell"
            >
              {expandableRows.renderContent(row)}
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  });
};
