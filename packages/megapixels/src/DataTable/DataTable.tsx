import type { ColumnDef, Row, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import type { ClassName } from './dataTableVariants';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { dataTableVariants } from './dataTableVariants';
import DataTableControl from './subcomponents/DataTableControl';

export { dataTableVariants } from './dataTableVariants';

export interface DataTableSearchField {
  /** Column id used by the built-in text search input. */
  column: string;
  /** Placeholder text for this search input. */
  placeholder?: string;
}

export interface DataTableIcons {
  /** Icons used by column visibility controls. */
  columnVisibility?: {
    /** Icon shown in the column visibility trigger; pass `false` to hide. */
    trigger?: ReactNode | false;
    /** Icon for visible columns in the menu; pass `false` to hide. */
    visible?: ReactNode | false;
  };
  /** Icons used by expandable row controls. */
  expandableRows?: {
    /** Icon for collapsed rows; pass `false` to hide. */
    collapsed?: ReactNode | false;
    /** Icon for expanded rows; pass `false` to hide. */
    expanded?: ReactNode | false;
  };
  /** Icons used by row-selection checkboxes. */
  selection?: {
    /** Icon for checked state; pass `false` to hide. */
    checked?: ReactNode | false;
    /** Icon for indeterminate state; pass `false` to hide. */
    indeterminate?: ReactNode | false;
  };
  /** Icons used for sorting indicators. */
  sort?: {
    /** Icon for ascending sort; pass `false` to hide. */
    asc?: ReactNode | false;
    /** Icon for descending sort; pass `false` to hide. */
    desc?: ReactNode | false;
    /** Icon for sortable-but-unsorted state; pass `false` to hide. */
    unsorted?: ReactNode | false;
  };
}

export interface DataTableExpandableRowsFeature<TData = unknown> {
  /**
   * Returns nested child rows for TanStack-style hierarchical expansion.
   * Provide this when your data contains multi-level rows (for example
   * `row.children` or `row.subRows`).
   */
  getSubRows?: (originalRow: TData, index: number) => TData[] | undefined;
  /** Content rendered in a full-width row below an expanded table row. */
  renderContent?: (row: Row<TData>) => ReactNode;
}

export interface DataTableFeatures<TData = unknown> {
  /** Enables the "Columns" menu for toggling visible columns. */
  columnVisibility?: boolean;
  /** Enables TanStack expanding for detail panels, nested sub rows, or both. */
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  /** Enables cursor-based infinite scroll behavior. */
  infiniteScroll?: DataTableInfiniteScrollFeature;
  /** Enables pagination row model and footer controls, optionally with page-size settings. */
  pagination?: boolean | DataTablePaginationFeature;
  /** Enables row selection and select-all checkbox column. */
  rowSelection?: boolean;
  /** Configuration for built-in text search inputs. */
  search?: {
    /** Built-in search inputs keyed by TanStack column id. */
    columns?: DataTableSearchField[];
  };
  /** Enables virtualization for large client-side data arrays. */
  virtualization?: DataTableVirtualizationFeature;
}

export interface DataTablePaginationFeature {
  /** Available page-size options. The first value becomes the initial page size. */
  pageSizeOptions?: number[];
  /** Shows the "Rows per page" selector in the pagination footer. */
  showRowsPerPage?: boolean;
}

/** Cursor pagination state provided by the parent data source. */
export interface InfiniteScrollPageInfo {
  /** Cursor for the currently loaded tail (used for forward pagination). */
  endCursor?: string | null;
  /** Whether a forward page exists beyond the currently loaded data. */
  hasNextPage: boolean;
  /** Total result size reported by the backend for total-count mode. */
  totalCount: number;
}

/** Infinite-scroll behavior configuration for DataTable. */
export interface DataTableInfiniteScrollFeature {
  /** True while the parent is fetching the next page. */
  isFetchingNextPage?: boolean;
  /** Custom loading-row content shown while next page is in flight. */
  loadingMoreContent?: ReactNode;
  /** True when the most recent load-more request failed. */
  loadMoreError?: boolean;
  /** Prefetch threshold from the loaded tail (in virtual rows). */
  loadMoreThreshold?: number;
  /** Callback used to request the next page from the parent. */
  onLoadMore: (args: { direction: 'forward'; cursor?: string | null }) => void;
  /** Server-side search callback for infinite mode. */
  onSearchChange?: (columnId: string, value: string) => void;
  /** Server-side sorting callback for infinite mode. */
  onSortingChange?: (sorting: SortingState) => void;
  /** Parent-provided cursor page metadata. */
  pageInfo: InfiniteScrollPageInfo;
  /** Custom retry-row content shown when `loadMoreError` is true. */
  retryContent?: ReactNode;
  /** Scrollbar strategy for infinite mode. */
  scrollbarMode?: 'loaded-count' | 'total-count';
}

/** Virtualization settings shared by DataTable and VirtualList behavior. */
export interface DataTableVirtualizationFeature {
  /** Enables dynamic DOM measurement for variable-height rows. */
  dynamicRowHeight?: boolean;
  /** Fallback row-height estimate used before measurement. */
  estimateRowHeight?: number;
  /** Scroll viewport max height. */
  maxHeight: number | string;
  /** Number of extra virtual rows rendered above/below the viewport. */
  overscan?: number;
  /** ScrollShadow fade size in pixels for virtualized containers. */
  scrollShadowSize?: number;
}

export interface DataTableProps<TData, TValue> {
  /** Accessible label for the underlying HTML table. */
  ariaLabel?: string;
  /** Slot-based class overrides generated from `dataTableVariants`. */
  className?: ClassName;
  /** TanStack column definitions used to render headers/cells. */
  columns: ColumnDef<TData, TValue>[];
  /** Row data rendered by the table. */
  data: TData[];
  /** Content shown when no rows match current table state. */
  emptyContent?: ReactNode;
  /** Grouped feature switches/configuration. */
  features?: DataTableFeatures<TData>;
  /** Optional icon overrides for all built-in DataTable icons. */
  icons?: DataTableIcons;
  /** Shows loading row instead of regular row output. */
  loading?: boolean;
  /** Content displayed inside the loading row. */
  loadingContent?: ReactNode;
  /** Optional `data-testid` prefix used for table controls. */
  testId?: string;
  /** Optional custom content rendered in the table toolbar area. */
  toolbarContent?: ReactNode;
}

/**
 * Configurable data table built on TanStack Table with semantic table markup
 *
 * Configure search, sorting, column visibility, row selection and pagination
 * through column definitions and `features`, with optional custom toolbar content
 *
 * Supports virtual scrolling and cursor-based loading for larger datasets
 * Customize individual slots through `className`
 */
const DataTable = <TData, TValue>({
  className = undefined,
  ...props
}: DataTableProps<TData, TValue>) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(dataTableVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return <DataTableControl {...props} className={classNames} />;
};

export default DataTable;
