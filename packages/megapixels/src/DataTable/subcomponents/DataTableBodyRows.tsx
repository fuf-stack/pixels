import type { Row } from '@tanstack/react-table';
import type { DataTableExpandableRowsFeature } from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import { Fragment } from 'react';

import { cn } from '@fuf-stack/pixel-utils';

import DataTableBodyCell from './DataTableBodyCell';

interface DataTableBodyRowsProps<TData> {
  /** Resolved CSS class names */
  className: DataTableClassNames;
  /** Expanded detail and nested-row configuration */
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  /** Visible rows from the table model */
  rows: Row<TData>[];
  /** Uses flex layout for virtual columns */
  virtualized?: boolean;
  /** Number of columns spanned by expanded detail rows */
  visibleColumnCount: number;
}

/**
 * Standard row renderer used in non-virtualized table mode.
 *
 * It renders:
 * - each data row
 * - an optional sibling expanded-content row that spans all visible columns
 */
const DataTableBodyRows = <TData,>({
  /** Resolved CSS class names */
  className: classNames,
  expandableRows = undefined,
  rows,
  visibleColumnCount,
  virtualized = false,
}: DataTableBodyRowsProps<TData>) => {
  return rows.map((row) => {
    return (
      <Fragment key={row.id}>
        <tr
          className={classNames.tr}
          data-slot="tr"
          data-state={row.getIsSelected() ? 'selected' : undefined}
          style={virtualized ? { display: 'flex', width: '100%' } : undefined}
        >
          {row.getVisibleCells().map((cell) => {
            return (
              <DataTableBodyCell
                key={cell.id}
                cell={cell}
                className={classNames}
                virtualized={virtualized}
              />
            );
          })}
        </tr>

        {/* Expanded detail content is rendered as a separate full-width row. */}
        {expandableRows?.renderContent && row.getIsExpanded() ? (
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

export default DataTableBodyRows;
