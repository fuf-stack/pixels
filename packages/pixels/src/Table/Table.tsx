import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import {
  getKeyValue,
  Table as NextTable,
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
        td: 'border-divider first:rounded-s-lg last:rounded-e-lg group-data-[odd=true]:bg-content2',
      },
      striped: {
        tr: '',
        td: 'first:rounded-s-lg last:rounded-e-lg group-data-[odd=true]:bg-content2',
      },
      none: {},
    },
  },
});

type VariantProps = TVProps<typeof tableVariants>;
type ClassName = TVClassName<typeof tableVariants>;

export interface TableColumnProps {
  key: string;
  label: ReactNode;
}

interface TableRowProps {
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
  rows = [],
  separation = 'none',
  stickyHeader = false,
  testId = undefined,
}: TableProps) => {
  const variants = tableVariants({ separation });
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <NextTable
      aria-label={ariaLabel}
      bottomContent={bottomContent}
      classNames={classNames}
      data-testid={testId && slugify(testId)}
      hideHeader={hideHeader}
      isHeaderSticky={stickyHeader}
      isStriped={separation === 'striped' || separation === 'striped-divider-x'}
      removeWrapper={!hasWrapper}
    >
      <TableHeader columns={columns}>
        {(column: TableColumnProps) => (
          <TableColumn key={column.key}>{column.label}</TableColumn>
        )}
      </TableHeader>
      <TableBody
        isLoading={loading}
        loadingContent={loadingContent || '...'} // TODO: use future spinner/loading component
        emptyContent={emptyContent}
        items={rows}
      >
        {(item: TableRowProps) => (
          <TableRow
            key={item.key}
            // data-testid={`${slugify(testId || 'table')}_item_${slugify(JSON.stringify(item.testId || item.key))}`}
          >
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </NextTable>
  );
};

export default Table;
