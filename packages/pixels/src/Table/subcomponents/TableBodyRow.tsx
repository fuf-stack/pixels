import type { TableState } from 'react-stately';
import type { TableRowProps } from '../Table';
import type { TableClassNames } from '../tableVariants';
import type { TableNode } from './TableGrid';

import { useRef } from 'react';
import { mergeProps, useFocusRing, useTableRow } from 'react-aria';

import TableCell from './TableCell';

interface TableBodyRowProps {
  /** CSS class name */
  className: TableClassNames;
  /** Total number of data rows */
  count: number;
  /** Zero-based row position */
  index: number;
  /** Collection node for the data row */
  node: TableNode;
  /** Fixed row height when virtualized */
  rowHeight: number;
  /** Full table collection and focus state */
  state: TableState<TableRowProps>;
  /** Whether only a row window is mounted */
  virtualized: boolean;
}

/** Data row associations and position-dependent styling attributes
 *
 * @see https://react-aria.adobe.com/Table/useTable
 */
const TableBodyRow = ({
  className,
  count,
  index,
  node,
  rowHeight,
  state,
  virtualized,
}: TableBodyRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const { rowProps } = useTableRow(
    { isVirtualized: virtualized, node },
    state,
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <tr
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      className={className.tr}
      data-first={index === 0 || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-last={index === count - 1 || undefined}
      data-odd={index % 2 === 1 || undefined}
      data-slot="tr"
      style={virtualized ? { height: rowHeight } : undefined}
    >
      {Array.from(node.childNodes).map((cell) => {
        return (
          <TableCell
            key={cell.key}
            className={className.td}
            node={cell}
            state={state}
            virtualized={virtualized}
          />
        );
      })}
    </tr>
  );
};

export default TableBodyRow;
