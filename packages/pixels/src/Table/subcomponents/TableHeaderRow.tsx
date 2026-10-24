import type { TableState } from 'react-stately';
import type { TableRowProps } from '../Table';
import type { TableClassNames } from '../tableVariants';
import type { TableNode } from './TableGrid';

import { useRef } from 'react';
import { useTableHeaderRow } from 'react-aria';

import TableHeaderCell from './TableHeaderCell';

interface TableHeaderRowProps {
  /** CSS class name */
  className: TableClassNames;
  /** Collection node for the header row */
  node: TableNode;
  /** Full table collection and focus state */
  state: TableState<TableRowProps>;
  /** Whether only a row window is mounted */
  virtualized: boolean;
}

/** Header row associations and native column headings
 *
 * @see https://react-aria.adobe.com/Table/useTable
 */
const TableHeaderRow = ({
  className,
  node,
  state,
  virtualized,
}: TableHeaderRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const { rowProps } = useTableHeaderRow(
    { isVirtualized: virtualized, node },
    state,
    ref,
  );

  return (
    <tr {...rowProps} ref={ref} className={className.tr} data-slot="tr">
      {Array.from(node.childNodes).map((column) => {
        return (
          <TableHeaderCell
            key={column.key}
            className={className.th}
            node={column}
            state={state}
            virtualized={virtualized}
          />
        );
      })}
    </tr>
  );
};

export default TableHeaderRow;
