import type { Column, Table } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { LuColumns3 } from 'react-icons/lu';

import Menu from '@fuf-stack/pixels/Menu';

/**
 * Resolves a human-readable label for a column, preferring its string header
 * over the raw TanStack column id (e.g. "Status" instead of "status").
 */
const getColumnLabel = <TData,>(column: Column<TData>): string => {
  const { header } = column.columnDef;
  return typeof header === 'string' ? header : column.id;
};

interface ViewOptionsClassNames {
  viewOptionsIndicator?: string;
  viewOptionsItem?: string;
  viewOptionsTrigger?: string;
}

export interface DataTableViewOptionsProps<TData> {
  /** Slot-driven class names forwarded from DataTable variants. */
  classNames: ViewOptionsClassNames;
  /** TanStack table instance used to enumerate/toggle columns. */
  table: Table<TData>;
  /** Icon shown in the trigger; pass `false` to hide. */
  triggerIcon?: ReactNode | false;
  /** Icon shown for visible columns; pass `false` to hide. */
  visibleIcon?: ReactNode | false;
  /** Optional test id prefix used for the trigger. */
  testId?: string;
}

/** Dropdown for toggling table column visibility. */
const DataTableViewOptions = <TData,>({
  classNames,
  table,
  triggerIcon = <LuColumns3 />,
  visibleIcon = '✓',
  testId = undefined,
}: DataTableViewOptionsProps<TData>) => {
  // Only show columns TanStack allows to be hidden.
  const hideableColumns = table.getAllColumns().filter((column) => {
    return column.getCanHide();
  });

  // Fast lookup for onAction callbacks from menu key -> column instance.
  const columnsById = new Map(
    hideableColumns.map((column) => {
      return [column.id, column] as const;
    }),
  );

  const items = hideableColumns.map((column) => {
    const columnLabel = getColumnLabel(column);
    return {
      key: column.id,
      className: classNames.viewOptionsItem,
      dataSlot: 'view-options-item',
      textValue: columnLabel,
      label: (
        <span className="flex items-center gap-2">
          <span
            className={classNames.viewOptionsIndicator}
            data-slot="view-options-indicator"
          >
            {column.getIsVisible() && visibleIcon !== false ? visibleIcon : ''}
          </span>
          {columnLabel}
        </span>
      ),
    };
  });

  return (
    <Menu
      items={items}
      onAction={(key) => {
        const column = columnsById.get(String(key));
        if (!column) {
          return;
        }
        column.toggleVisibility(!column.getIsVisible());
      }}
      testId={testId ? `${testId}-column-visibility-trigger` : undefined}
      triggerButtonProps={{
        'aria-label': 'Toggle column visibility',
        className: classNames.viewOptionsTrigger,
        dataSlot: 'view-options-trigger',
        disableRipple: true,
        size: 'sm',
        variant: 'bordered',
      }}
    >
      {triggerIcon === false ? null : triggerIcon}
      Columns
    </Menu>
  );
};

export default DataTableViewOptions;
