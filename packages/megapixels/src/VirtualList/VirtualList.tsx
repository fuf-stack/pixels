import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type {
  DataTableInfiniteScrollFeature,
  DataTableVirtualizationFeature,
} from '../DataTable';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useInfiniteVirtualizer } from '../hooks/useInfiniteVirtualizer';

export const virtualListVariants = tv({
  slots: {
    // Root wrapper for the entire component.
    base: 'w-full max-w-2xl',
    // Rendered item row for loaded data.
    item: 'box-border border-b border-divider bg-content1 p-3 text-foreground',
    // Positioned list container that owns virtual row placement.
    list: 'relative m-0 list-none p-0',
    // Footer row for loading/retry actions in infinite mode.
    loadingMoreCell: 'py-3 text-center text-default-500',
    // Skeleton-like placeholder for unloaded rows in total-count mode.
    placeholderItem: 'box-border border-b border-divider bg-content1 px-3',
    // Scrollable viewport used as the virtualizer scroll element.
    scrollContainer:
      'w-full min-w-80 overflow-y-auto overflow-x-hidden rounded-md border border-divider bg-content1',
  },
});

type VirtualListClassName = TVClassName<typeof virtualListVariants>;

export interface VirtualListProps<TData> {
  /** Slot-based class overrides generated from `virtualListVariants`. */
  className?: VirtualListClassName;
  /** Currently loaded items to render. */
  data: TData[];
  /** Optional cursor-based infinite-scroll configuration. */
  infiniteScroll?: DataTableInfiniteScrollFeature;
  /** Content rendered in the load-more row while fetching. */
  loadingMoreContent?: ReactNode;
  /** Fallback retry label when load-more has failed. */
  retryContent?: ReactNode;
  /** Renderer for each loaded item. */
  renderItem: (item: TData, index: number) => ReactNode;
  /** Optional `data-testid` prefix. */
  testId?: string;
  /** Virtualizer viewport and measurement options. */
  virtualization: DataTableVirtualizationFeature;
}

/**
 * Generic virtualized list with optional cursor-based infinite scrolling.
 *
 * Behavior:
 * - renders only virtualized rows for performance
 * - supports dynamic heights via shared `useInfiniteVirtualizer`
 * - supports two scrollbar strategies in infinite mode (`loaded-count` and
 *   `total-count`) by appending placeholders and a load-more sentinel
 */
const VirtualList = <TData,>({
  className = undefined,
  data,
  infiniteScroll = undefined,
  loadingMoreContent = 'Loading more...',
  renderItem,
  retryContent = 'Load next page',
  testId = undefined,
  virtualization,
}: VirtualListProps<TData>) => {
  const variants = virtualListVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  /** Internal flattened item model consumed by the virtualizer render loop. */
  type VirtualListItem =
    | { index: number; key: string; kind: 'item'; value: TData }
    | { index: number; key: string; kind: 'load-more' | 'placeholder' };

  // Start with currently loaded data items.
  const baseItems: VirtualListItem[] = data.map((item, index) => {
    return {
      index,
      key: `item-${index}`,
      kind: 'item',
      value: item,
    };
  });

  if (infiniteScroll?.scrollbarMode === 'total-count') {
    // Reserve full scrollbar height by adding placeholders for unloaded rows.
    const placeholderCount = Math.max(
      infiniteScroll.pageInfo.totalCount - data.length,
      0,
    );
    for (
      let placeholderOffset = 0;
      placeholderOffset < placeholderCount;
      placeholderOffset += 1
    ) {
      baseItems.push({
        index: data.length + placeholderOffset,
        key: `placeholder-${data.length + placeholderOffset}`,
        kind: 'placeholder',
      });
    }
  }

  if (
    infiniteScroll &&
    (infiniteScroll.pageInfo.hasNextPage ||
      infiniteScroll.isFetchingNextPage ||
      infiniteScroll.loadMoreError)
  ) {
    // Add a trailing sentinel row for loading/retry behavior.
    baseItems.push({
      index: -1,
      key: 'load-more',
      kind: 'load-more',
    });
  }

  const loadedItemCount = data.length;

  // Shared virtualizer handles windowing + load-more triggering; this component
  // only maps its virtual items to list markup.
  const { measureElement, retry, scrollElementRef, totalSize, virtualItems } =
    useInfiniteVirtualizer({
      count: baseItems.length,
      dynamicRowHeight:
        virtualization.dynamicRowHeight ?? Boolean(infiniteScroll),
      estimateSize: () => {
        return virtualization.estimateRowHeight ?? 45;
      },
      hasNextPage: infiniteScroll?.pageInfo.hasNextPage,
      isFetchingNextPage: infiniteScroll?.isFetchingNextPage,
      loadedCount: loadedItemCount,
      loadMoreError: infiniteScroll?.loadMoreError,
      loadMoreThreshold: infiniteScroll?.loadMoreThreshold,
      onLoadMore: infiniteScroll
        ? () => {
            infiniteScroll.onLoadMore({
              cursor: infiniteScroll.pageInfo.endCursor,
              direction: 'forward',
            });
          }
        : undefined,
      overscan: virtualization.overscan,
      // Decide when to request the next page from the parent.
      shouldLoadMore: ({ loadMoreThreshold, virtualItems: activeItems }) => {
        if (!infiniteScroll) {
          return false;
        }

        // If placeholders or the load-more row are visible, fetch immediately.
        const kindsInRange = new Set(
          activeItems.map((item) => {
            return baseItems[item.index]?.kind;
          }),
        );
        if (kindsInRange.has('placeholder') || kindsInRange.has('load-more')) {
          return true;
        }

        // Otherwise prefetch shortly before the loaded tail enters viewport.
        const lastVirtualIndex =
          activeItems[activeItems.length - 1]?.index ?? 0;
        const boundary = Math.max(loadedItemCount - loadMoreThreshold - 1, 0);
        return lastVirtualIndex >= boundary;
      },
    });

  return (
    <div className={classNames.base} data-slot="base" data-testid={testId}>
      <div
        ref={scrollElementRef}
        className={classNames.scrollContainer}
        data-slot="scroll-container"
        style={{ maxHeight: virtualization.maxHeight }}
      >
        <ul
          className={classNames.list}
          data-slot="list"
          // Total virtual height (loaded rows + optional placeholders/sentinel).
          style={{ height: `${totalSize}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const item = baseItems[virtualItem.index];
            if (!item) {
              return null;
            }

            if (item.kind === 'placeholder') {
              // Reserved space for rows we have not loaded yet (total-count mode).
              return (
                <li
                  key={item.key}
                  ref={measureElement}
                  className={classNames.placeholderItem}
                  data-index={virtualItem.index}
                  data-slot="placeholder-item"
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    height: `${virtualItem.size}px`,
                    position: 'absolute',
                    transform: `translateY(${virtualItem.start}px)`,
                    width: '100%',
                  }}
                >
                  <span className="block h-3 w-2/3 animate-pulse rounded bg-default-300/50 dark:bg-default-300/20" />
                </li>
              );
            }

            if (item.kind === 'load-more') {
              // Infinite-scroll sentinel row: loading indicator or retry action.
              return (
                <li
                  key={item.key}
                  ref={measureElement}
                  className={classNames.loadingMoreCell}
                  data-index={virtualItem.index}
                  data-slot="loading-more-cell"
                  style={{
                    position: 'absolute',
                    transform: `translateY(${virtualItem.start}px)`,
                    width: '100%',
                  }}
                >
                  {infiniteScroll?.loadMoreError ? (
                    <button onClick={retry} type="button">
                      {infiniteScroll.retryContent ?? retryContent}
                    </button>
                  ) : (
                    loadingMoreContent
                  )}
                </li>
              );
            }

            if (item.kind === 'item') {
              return (
                // Standard loaded item row.
                <li
                  key={item.key}
                  ref={measureElement}
                  className={classNames.item}
                  data-index={virtualItem.index}
                  data-slot="item"
                  style={{
                    position: 'absolute',
                    transform: `translateY(${virtualItem.start}px)`,
                    width: '100%',
                  }}
                >
                  {renderItem(item.value, item.index)}
                </li>
              );
            }

            return null;
          })}
        </ul>
      </div>
    </div>
  );
};

export default VirtualList;
