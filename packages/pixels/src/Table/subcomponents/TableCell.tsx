import type { TableState } from 'react-stately';
import type { TableRowProps } from '../Table';
import type { TableNode } from './TableGrid';

import { useRef } from 'react';
import { mergeProps, useFocusRing, useTableCell } from 'react-aria';

interface TableCellProps {
  /** CSS class name */
  className: string;
  /** Collection node for the data cell */
  node: TableNode;
  /** Full table collection and focus state */
  state: TableState<TableRowProps>;
  /** Whether only a row window is mounted */
  virtualized: boolean;
}

/** Cell associations and keyboard focus within its owning data row
 *
 * @see https://react-aria.adobe.com/Table/useTable
 */
const TableCell = ({ className, node, state, virtualized }: TableCellProps) => {
  const ref = useRef<HTMLTableCellElement>(null);
  const { gridCellProps } = useTableCell(
    { node, isVirtualized: virtualized },
    state,
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      ref={ref}
      className={className}
      data-focus-visible={isFocusVisible || undefined}
      data-slot="td"
    >
      {typeof node.rendered === 'string' ||
      typeof node.rendered === 'number' ? (
        <span>{node.rendered}</span>
      ) : (
        node.rendered
      )}
    </td>
  );
};

export default TableCell;
