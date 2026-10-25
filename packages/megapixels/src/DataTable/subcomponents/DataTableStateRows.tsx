import type { ReactNode } from 'react';
import type { DataTableClassNames } from '../dataTableVariants';

interface DataTableStateRowsProps {
  /** Resolved CSS class names */
  className: DataTableClassNames;
  /** Content when there are no matching rows */
  emptyContent: ReactNode;
  /** Shows the initial loading state */
  loading: boolean;
  /** Content during initial loading */
  loadingContent: ReactNode;
  /** Number of visible table rows */
  rowCount: number;
  /** Number of columns spanned by status cells */
  visibleColumnCount: number;
}

/** Full-width loading and empty rows without replacing the table structure */
const DataTableStateRows = ({
  className: classNames,
  emptyContent,
  loading,
  loadingContent,
  rowCount,
  visibleColumnCount,
}: DataTableStateRowsProps) => {
  return (
    <>
      {loading ? (
        <tr className={classNames.tr} data-slot="tr">
          <td
            className={classNames.loadingCell}
            colSpan={visibleColumnCount}
            data-slot="loading-cell"
          >
            {loadingContent}
          </td>
        </tr>
      ) : null}
      {!loading && rowCount === 0 ? (
        <tr className={classNames.tr} data-slot="tr">
          <td
            className={classNames.emptyCell}
            colSpan={visibleColumnCount}
            data-slot="empty-cell"
          >
            {emptyContent}
          </td>
        </tr>
      ) : null}
    </>
  );
};

export default DataTableStateRows;
