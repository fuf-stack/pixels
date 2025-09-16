import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import {
  getKeyValue,
  Table as HeroTable,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// table styling variants
export const tableVariants = tv({
  slots: {
    base: '',
    wrapper: '',
    table: '',
    thead: '',
    tbody: '',
    tr: '',
    th: 'bg-content2',
    td: '',
    tfoot: '',
    sortIcon: '',
    emptyWrapper: '',
    loadingWrapper: '',
  },
  variants: {
    separation: {
      divider: {
        tr: 'divide-x rounded-lg border-b data-[last=true]:border-none [&:first-child:not([data-first="true"])]:border-none',
      },
      'divider-x': {
        tr: 'divide-x',
      },
      'divider-y': {
        tr: 'rounded-lg border-b data-[last=true]:border-none [&:first-child:not([data-first="true"])]:border-none',
      },
      'striped-divider-x': {
        tr: 'divide-x',
        th: 'border-divider',
        td: 'border-divider group-data-[odd=true]:bg-content2 first:rounded-s-lg last:rounded-e-lg',
      },
      striped: {
        tr: '',
        td: 'group-data-[odd=true]:bg-content2 first:rounded-s-lg last:rounded-e-lg',
      },
      none: {},
    },
  },
});

export type VariantProps = TVProps<typeof tableVariants>;
type ClassName = TVClassName<typeof tableVariants>;

export interface TableColumnProps {
  key: string;
  label: ReactNode;
}

export interface TableRowProps {
  key: string | number;
  [key: string | number]: ReactNode;
}

export interface TableProps extends VariantProps {
  /** Aria label for the Table. */
  ariaLabel?: string;
  /** Component to display at the bottom of the Table. */
  bottomContent?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Objects with table data */
  columns: TableColumnProps[];
  /** Component to display if there are no rows! */
  emptyContent?: ReactNode;
  /** Determine if the Table should have a card like wrapper. */
  hasWrapper?: boolean;
  /** remove header */
  hideHeader?: boolean;
  /** Tells the Table to show the loading component. */
  loading?: boolean;
  /** Loading animation component. */
  loadingContent?: ReactNode;
  /** The maximum height of the table in pixels. Required when using virtualization. */
  maxTableHeight?: number;
  /** The fixed height of each row item in pixels. Required when using virtualization. */
  rowHeight?: number;
  /** Items displayed as rows in the Table. Should have key-value pair for each column. */
  rows?: TableRowProps[];
  /** Separation style for the rows & columns. */
  separation?:
    | 'none'
    | 'striped'
    | 'striped-divider-x'
    | 'divider-x'
    | 'divider-y'
    | 'divider';
  /** Keeps the header of the Table in view while scrolling a height limited Table. */
  stickyHeader?: boolean;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Virtualize allows efficient rendering of large lists by only rendering items that are visible in the viewport. */
  virtualized?: boolean;
}

/**
 * Table component based on [HeroUI Table](https://www.heroui.com//docs/components/table)
 */
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
  const variants = tableVariants({ separation });
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <HeroTable
      aria-label={ariaLabel}
      bottomContent={bottomContent}
      classNames={classNames}
      data-testid={testId ? slugify(testId) : null}
      hideHeader={hideHeader}
      isHeaderSticky={stickyHeader}
      isStriped={separation === 'striped' || separation === 'striped-divider-x'}
      isVirtualized={virtualized}
      maxTableHeight={maxTableHeight}
      removeWrapper={virtualized ? false : !hasWrapper} // always show wrapper if virtualized
      rowHeight={rowHeight}
    >
      <TableHeader columns={columns}>
        {(column: TableColumnProps) => {
          return <TableColumn key={column.key}>{column.label}</TableColumn>;
        }}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent}
        isLoading={loading}
        items={rows}
        loadingContent={loadingContent ?? '...'} // TODO: use future spinner/loading component
      >
        {(item: TableRowProps) => {
          return (
            <TableRow
              key={item.key}
              // data-testid={`${slugify(testId || 'table')}_item_${slugify(JSON.stringify(item.testId || item.key))}`}
            >
              {(columnKey) => {
                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
              }}
            </TableRow>
          );
        }}
      </TableBody>
    </HeroTable>
  );
};

export default Table;
