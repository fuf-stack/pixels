import type { VirtualItem } from '@tanstack/react-virtual';
import type { VirtualListProps } from '../VirtualList';
import type { VirtualListClassNames } from '../virtualListVariants';

/** Loaded item, reserved placeholder or trailing load-more row */
export type VirtualListItem<TData> =
  | { index: number; key: string; kind: 'item'; value: TData }
  | { index: number; key: string; kind: 'load-more' | 'placeholder' };

interface VirtualListRowProps<TData> extends Pick<
  VirtualListProps<TData>,
  'infiniteScroll' | 'loadingMoreContent' | 'renderItem' | 'retryContent'
> {
  /** Resolved CSS class names */
  className: VirtualListClassNames;
  /** Item represented by this virtual position */
  item: VirtualListItem<TData>;
  /** Registers the rendered row for height measurement */
  measureElement?: (node: HTMLElement | null) => void;
  /** Retries the failed page request */
  retry: () => void;
  /** Virtual row position and measured size */
  virtualItem: VirtualItem;
}

/** Positioned list row for loaded content, reserved space or load-more actions */
const VirtualListRow = <TData,>({
  className: classNames,
  infiniteScroll = undefined,
  item,
  loadingMoreContent = undefined,
  measureElement = undefined,
  renderItem,
  retry,
  retryContent = undefined,
  virtualItem,
}: VirtualListRowProps<TData>) => {
  if (item.kind === 'placeholder') {
    // reserved space for rows we have not loaded yet (total-count mode)
    return (
      <li
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
    // infinite-scroll sentinel row: loading indicator or retry action
    return (
      <li
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
      // standard loaded item row
      <li
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
};

export default VirtualListRow;
