import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './tableVariants';

import { slugify } from '@fuf-stack/pixel-utils';

import { useStyling } from '../StylingProvider';
import TableGrid from './subcomponents/TableGrid';
import { tableVariants } from './tableVariants';

export { tableVariants } from './tableVariants';
export type { VariantProps } from './tableVariants';

export interface TableColumnProps {
  /** Unique column key */
  key: string;
  /** Column heading */
  label: ReactNode;
}

export interface TableRowProps {
  /** Cell content indexed by column key */
  [key: string | number]: ReactNode;
  /** Unique row key */
  key: string | number;
}

export interface TableProps extends VariantProps {
  /** Accessible name of the table */
  ariaLabel?: string;
  /** Content below the table */
  bottomContent?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Column headings and row property keys */
  columns: TableColumnProps[];
  /** Message shown when no rows are available */
  emptyContent?: ReactNode;
  /** Wraps the table in a scrolling card surface */
  hasWrapper?: boolean;
  /** Hides column headings */
  hideHeader?: boolean;
  /** Shows loading content over existing rows */
  loading?: boolean;
  /** Content announced while loading */
  loadingContent?: ReactNode;
  /** Scroll surface height in pixels, defaults to 600 when virtualized */
  maxTableHeight?: number;
  /** Fixed virtual row height in pixels, defaults to 40 */
  rowHeight?: number;
  /** Row values indexed by column key */
  rows?: TableRowProps[];
  /** Separation treatment for rows and columns */
  separation?:
    | 'none'
    | 'striped'
    | 'striped-divider-x'
    | 'divider-x'
    | 'divider-y'
    | 'divider';
  /** Keeps column headings visible while scrolling */
  stickyHeader?: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Renders a bounded window of rows for large collections */
  virtualized?: boolean;
}

/** Data arranged in columns and rows, with keyboard navigation and optional virtual scrolling */
const Table = ({
  ariaLabel = undefined,
  bottomContent = undefined,
  className = undefined,
  columns,
  emptyContent = 'No rows to display.',
  hasWrapper = false,
  hideHeader = false,
  loading = false,
  loadingContent = undefined,
  maxTableHeight = undefined,
  rowHeight = undefined,
  rows = [],
  separation = 'none',
  stickyHeader = false,
  testId = undefined,
  virtualized = false,
}: TableProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(tableVariants, {
    hideHeader,
    separation,
    stickyHeader,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      className={classNames.base}
      data-slot="base"
      data-testid={testId ? slugify(testId) : undefined}
    >
      <TableGrid
        ariaLabel={ariaLabel}
        bottomContent={bottomContent}
        className={classNames}
        columns={columns}
        emptyContent={emptyContent}
        hasWrapper={hasWrapper}
        loading={loading}
        loadingContent={loadingContent}
        maxTableHeight={maxTableHeight}
        rowHeight={rowHeight}
        rows={rows}
        stickyHeader={stickyHeader}
        virtualized={virtualized}
      />
    </div>
  );
};

export default Table;
