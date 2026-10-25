import type { Header } from '@tanstack/react-table';
import type { DataTableIcons } from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import { flexRender } from '@tanstack/react-table';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';

import { getSortIndicator } from '../hooks/useDataTableController';
import {
  getColumnKind,
  getControlCellContentDataSlot,
  getHeaderDataSlot,
  getVirtualCellStyle,
} from './dataTableCellHelpers';

interface DataTableHeaderCellProps<TData, TValue> {
  /** Slot classes resolved by `dataTableVariants` */
  className: DataTableClassNames;
  /** TanStack header instance for this column */
  header: Header<TData, TValue>;
  /** Optional custom sort icons (asc/desc/unsorted) */
  sortIcons?: DataTableIcons['sort'];
  /** Enables flex sizing for virtualized header layout */
  virtualized?: boolean;
}

/**
 * Renders one header cell and encapsulates sortable/non-sortable behavior.
 */
const DataTableHeaderCell = <TData, TValue>({
  className: classNames,
  header,
  sortIcons = undefined,
  virtualized = false,
}: DataTableHeaderCellProps<TData, TValue>) => {
  // sorting UI is only rendered when the column opts into sorting
  const canSort = header.column.getCanSort();
  const columnKind = getColumnKind(header.column.id);
  const isExpansionColumn = columnKind === 'expansion';
  const isSelectionColumn = columnKind === 'selection';
  const sortState = header.column.getIsSorted();
  const sortIndicator = getSortIndicator(canSort, sortState, sortIcons);

  if (header.isPlaceholder) {
    // TanStack placeholder header used to preserve grouped-header alignment
    return (
      <th
        key={header.id}
        aria-label="Empty column header"
        className={classNames.th}
        data-slot={getHeaderDataSlot(columnKind)}
      />
    );
  }

  // cycle this column between its ascending and descending sort state
  const handleSort = () => {
    header.column.toggleSorting(sortState === 'asc');
  };

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
          onClick={handleSort}
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

export default DataTableHeaderCell;
