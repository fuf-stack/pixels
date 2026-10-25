import type { ReactNode } from 'react';
import type {
  DataTableInfiniteScrollFeature,
  DataTableVirtualizationFeature,
} from '../DataTable';
import type { ClassName } from './virtualListVariants';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import VirtualListControl from './subcomponents/VirtualListControl';
import { virtualListVariants } from './virtualListVariants';

export { virtualListVariants } from './virtualListVariants';

export interface VirtualListProps<TData> {
  /** Slot-based class overrides generated from `virtualListVariants`. */
  className?: ClassName;
  /** Currently loaded items to render. */
  data: TData[];
  /** Optional cursor-based infinite-scroll configuration. */
  infiniteScroll?: DataTableInfiniteScrollFeature;
  /** Content rendered in the load-more row while fetching. */
  loadingMoreContent?: ReactNode;
  /** Renderer for each loaded item. */
  renderItem: (item: TData, index: number) => ReactNode;
  /** Fallback retry label when load-more has failed. */
  retryContent?: ReactNode;
  /** Optional `data-testid` prefix. */
  testId?: string;
  /** Virtualizer viewport and measurement options. */
  virtualization: DataTableVirtualizationFeature;
}

/**
 * Virtualized list for browsing large or incrementally loaded datasets
 *
 * Renders items within the scroll viewport with support for variable item heights
 * and optional cursor-based loading
 *
 * Infinite scrolling can size the scrollbar to loaded items or the total result
 * count, using placeholders for items that have not loaded yet
 */
const VirtualList = <TData,>({
  className = undefined,
  ...props
}: VirtualListProps<TData>) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(virtualListVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return <VirtualListControl {...props} className={classNames} />;
};

export default VirtualList;
