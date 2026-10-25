import type { Cell } from '@tanstack/react-table';
import type { DataTableClassNames } from '../dataTableVariants';

import { flexRender } from '@tanstack/react-table';

import { cn } from '@fuf-stack/pixel-utils';

import {
  getCellDataSlot,
  getColumnKind,
  getControlCellContentDataSlot,
  getVirtualCellStyle,
} from './dataTableCellHelpers';

interface DataTableBodyCellProps<TData> {
  /** TanStack body cell instance to render */
  cell: Cell<TData, unknown>;
  /** Slot classes resolved by `dataTableVariants` */
  className: DataTableClassNames;
  /** Enables flex sizing for virtualized row layout */
  virtualized?: boolean;
}

/**
 * Renders one body cell and hides control-column wrapper details from row loops.
 */
const DataTableBodyCell = <TData,>({
  cell,
  className: classNames,
  virtualized = false,
}: DataTableBodyCellProps<TData>) => {
  const columnKind = getColumnKind(cell.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const isControlColumn = columnKind !== 'data';
  const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
  // nested rows are visually indented only in the expansion control column
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

export default DataTableBodyCell;
