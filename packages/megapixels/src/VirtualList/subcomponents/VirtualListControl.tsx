import type { VirtualListProps } from '../VirtualList';
import type { VirtualListClassNames } from '../virtualListVariants';
import type { VirtualListItem } from './VirtualListRow';

import { ScrollShadow } from '@fuf-stack/pixels/ScrollShadow';

import { useInfiniteVirtualizer } from '../../hooks/useInfiniteVirtualizer';
import VirtualListRow from './VirtualListRow';

interface VirtualListControlProps<TData> extends Omit<
  VirtualListProps<TData>,
  'className'
> {
  /** Resolved CSS classes for the component slots */
  className: VirtualListClassNames;
}

/** Virtualized item modelling, loading decisions and scroll presentation */
const VirtualListControl = <TData,>({
  className: classNames,
  data,
  infiniteScroll = undefined,
  loadingMoreContent = 'Loading more...',
  renderItem,
  retryContent = 'Load next page',
  testId = undefined,
  virtualization,
}: VirtualListControlProps<TData>) => {
  // start with currently loaded data items
  const baseItems: VirtualListItem<TData>[] = data.map((item, index) => {
    return {
      index,
      key: `item-${index}`,
      kind: 'item',
      value: item,
    };
  });

  if (infiniteScroll?.scrollbarMode === 'total-count') {
    // reserve full scrollbar height by adding placeholders for unloaded rows
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
    // add a trailing sentinel row for loading/retry behavior
    baseItems.push({
      index: -1,
      key: 'load-more',
      kind: 'load-more',
    });
  }

  const loadedItemCount = data.length;

  // shared virtualizer handles windowing + load-more triggering, this component
  // only maps its virtual items to list markup
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
      // decide when to request the next page from the parent
      shouldLoadMore: ({ loadMoreThreshold, virtualItems: activeItems }) => {
        if (!infiniteScroll) {
          return false;
        }

        // if placeholders or the load-more row are visible, fetch immediately
        const kindsInRange = new Set(
          activeItems.map((item) => {
            return baseItems[item.index]?.kind;
          }),
        );
        if (kindsInRange.has('placeholder') || kindsInRange.has('load-more')) {
          return true;
        }

        // otherwise prefetch shortly before the loaded tail enters viewport
        const lastVirtualIndex =
          activeItems[activeItems.length - 1]?.index ?? 0;
        const boundary = Math.max(loadedItemCount - loadMoreThreshold - 1, 0);
        return lastVirtualIndex >= boundary;
      },
    });

  return (
    <div
      className={classNames.base}
      data-component="virtual-list"
      data-slot="base"
      data-testid={testId}
    >
      <div className={classNames.scrollFrame} data-slot="scroll-frame">
        <ScrollShadow
          ref={scrollElementRef}
          className={
            classNames.scrollShadow
              ? `${classNames.scrollContainer} ${classNames.scrollShadow}`
              : classNames.scrollContainer
          }
          // show scroll shadow when there is no page load more error
          dataSlot="scroll-container"
          size={virtualization.scrollShadowSize ?? 40}
          style={{ maxHeight: virtualization.maxHeight }}
          // show scroll shadow when there is no page load more error
          visibility={infiniteScroll?.loadMoreError ? 'none' : 'auto'}
        >
          <ul
            className={classNames.list}
            data-slot="list"
            // total virtual height (loaded rows + optional placeholders/sentinel)
            style={{ height: `${totalSize}px` }}
          >
            {virtualItems.map((virtualItem) => {
              const item = baseItems[virtualItem.index];
              if (!item) {
                return null;
              }

              return (
                <VirtualListRow
                  key={item.key}
                  className={classNames}
                  infiniteScroll={infiniteScroll}
                  item={item}
                  loadingMoreContent={loadingMoreContent}
                  measureElement={measureElement}
                  renderItem={renderItem}
                  retry={retry}
                  retryContent={retryContent}
                  virtualItem={virtualItem}
                />
              );
            })}
          </ul>
        </ScrollShadow>
      </div>
    </div>
  );
};

export default VirtualListControl;
