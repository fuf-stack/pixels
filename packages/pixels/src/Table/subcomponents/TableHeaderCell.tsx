import type { TableState } from 'react-stately';
import type { TableRowProps } from '../Table';
import type { TableNode } from './TableGrid';

import { useRef } from 'react';
import {
  mergeProps,
  useFocusRing,
  useHover,
  useTableColumnHeader,
} from 'react-aria';

interface TableHeaderCellProps {
  /** CSS class name */
  className: string;
  /** Collection node for the column */
  node: TableNode;
  /** Full table collection and focus state */
  state: TableState<TableRowProps>;
  /** Whether only a row window is mounted */
  virtualized: boolean;
}

/** Column heading associations, hover feedback and keyboard focus
 *
 * @see https://react-aria.adobe.com/Table/useTable
 */
const TableHeaderCell = ({
  className,
  node,
  state,
  virtualized,
}: TableHeaderCellProps) => {
  const ref = useRef<HTMLTableCellElement>(null);
  const { columnHeaderProps } = useTableColumnHeader(
    { node, isVirtualized: virtualized },
    state,
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({});

  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps, hoverProps)}
      ref={ref}
      className={className}
      data-focus-visible={isFocusVisible || undefined}
      data-hover={isHovered || undefined}
      data-slot="th"
    >
      {node.rendered}
    </th>
  );
};

export default TableHeaderCell;
