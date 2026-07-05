import type { VirtualItem } from '@tanstack/react-virtual';
import type { RefObject } from 'react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Configuration for the shared infinite virtualizer hook.
 */
export interface UseInfiniteVirtualizerParams {
  /** Total number of virtual items (loaded + placeholders/sentinels). */
  count: number;
  /** Enables dynamic measurement of row heights after render. */
  dynamicRowHeight?: boolean;
  /** Master switch for virtualization and load-more effects. */
  enabled?: boolean;
  /** Estimated item size used before real measurements are available. */
  estimateSize?: (index: number) => number;
  /** Whether another page exists beyond the currently loaded data. */
  hasNextPage?: boolean;
  /** True while the parent is currently fetching the next page. */
  isFetchingNextPage?: boolean;
  /**
   * Number of currently loaded items. Used to deduplicate load-more calls:
   * a new call is only made after the loaded count has changed (i.e. the
   * previous page arrived). Defaults to `count`.
   */
  loadedCount?: number;
  /** True when the latest load-more request failed. */
  loadMoreError?: boolean;
  /** Number of items before the tail where prefetch should trigger. */
  loadMoreThreshold?: number;
  /** Callback used to request the next page of data. */
  onLoadMore?: () => void;
  /** Number of extra items rendered above/below the viewport. */
  overscan?: number;
  /** Optional external scroll container ref consumed by the virtualizer. */
  scrollElementRef?: RefObject<HTMLDivElement | null>;
  /** Custom load-more trigger predicate for advanced item models. */
  shouldLoadMore?: (params: {
    /** Resolved threshold value passed to the predicate. */
    loadMoreThreshold: number;
    /** Current visible virtual items from the active virtualizer range. */
    virtualItems: VirtualItem[];
  }) => boolean;
}

const DEFAULT_ESTIMATE_SIZE = 45;
const DEFAULT_LOAD_MORE_THRESHOLD = 5;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_VIEWPORT_HEIGHT = 600;

/**
 * Shared virtualizer hook used by DataTable/VirtualList for infinite scrolling.
 *
 * What it handles:
 * - configures TanStack Virtual with optional dynamic row measurement
 * - triggers cursor/page loading when the visible range approaches the tail
 * - deduplicates repeated load-more triggers for the same loaded state/range
 * - provides fallback virtual items when `getVirtualItems()` is temporarily
 *   empty (common in test/JSDOM or before first measurements)
 * - exposes imperative helpers (`retry`, `scrollToTop`, `scrollToIndex`)
 *
 * Notes:
 * - `count` is the total virtual item count (can include placeholders/sentinel)
 * - `loadedCount` should represent only currently loaded items to let the
 *   dedup guard allow the next request after new data arrives
 * - `shouldLoadMore` can override default tail-threshold triggering logic
 */
export const useInfiniteVirtualizer = ({
  count,
  dynamicRowHeight = false,
  enabled = true,
  estimateSize,
  hasNextPage = false,
  isFetchingNextPage = false,
  loadedCount = undefined,
  loadMoreError = false,
  loadMoreThreshold = DEFAULT_LOAD_MORE_THRESHOLD,
  onLoadMore = undefined,
  overscan = DEFAULT_OVERSCAN,
  scrollElementRef: externalScrollElementRef = undefined,
  shouldLoadMore = undefined,
}: UseInfiniteVirtualizerParams) => {
  const localScrollElementRef = useRef<HTMLDivElement | null>(null);
  const scrollElementRef = externalScrollElementRef ?? localScrollElementRef;
  const lastTriggerKeyRef = useRef<string | null>(null);
  const resolvedLoadedCount = loadedCount ?? count;
  const [fallbackRange, setFallbackRange] = useState({
    scrollTop: 0,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
  });
  const resolvedEstimateSize = useMemo(() => {
    return (
      estimateSize ??
      (() => {
        return DEFAULT_ESTIMATE_SIZE;
      })
    );
  }, [estimateSize]);

  const isFirefox =
    typeof window !== 'undefined' &&
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    window.navigator.userAgent.includes('Firefox');

  const maybeLoadMore = useCallback(
    (virtualItems: VirtualItem[]) => {
      if (
        !enabled ||
        !hasNextPage ||
        isFetchingNextPage ||
        loadMoreError ||
        !onLoadMore
      ) {
        return;
      }

      const shouldTrigger = shouldLoadMore
        ? shouldLoadMore({
            loadMoreThreshold,
            virtualItems,
          })
        : virtualItems.some((item) => {
            return item.index >= Math.max(count - loadMoreThreshold - 1, 0);
          });

      if (!shouldTrigger) {
        return;
      }

      const lastVisibleIndex =
        virtualItems[virtualItems.length - 1]?.index ?? -1;
      const triggerKey = `${resolvedLoadedCount}:${lastVisibleIndex}`;

      // Avoid duplicate requests for the same loaded state and visible range,
      // while still allowing a later, deeper scroll to request the next page.
      if (lastTriggerKeyRef.current === triggerKey) {
        return;
      }

      lastTriggerKeyRef.current = triggerKey;
      onLoadMore();
    },
    [
      count,
      enabled,
      hasNextPage,
      isFetchingNextPage,
      loadMoreError,
      loadMoreThreshold,
      onLoadMore,
      resolvedLoadedCount,
      shouldLoadMore,
    ],
  );

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLElement>({
    count,
    enabled,
    estimateSize: resolvedEstimateSize,
    getScrollElement: () => {
      return scrollElementRef.current;
    },
    initialRect: {
      height: DEFAULT_VIEWPORT_HEIGHT,
      width: 1024,
    },
    measureElement:
      dynamicRowHeight && !isFirefox
        ? (element) => {
            return element.getBoundingClientRect().height;
          }
        : undefined,
    onChange: (instance) => {
      maybeLoadMore(instance.getVirtualItems());
    },
    overscan,
  });

  const estimatedItemSize = Math.max(resolvedEstimateSize(0), 1);

  const getFallbackVirtualItems = useCallback(
    (scrollTop: number, viewportHeight: number): VirtualItem[] => {
      const fallbackStartIndex = Math.max(
        Math.floor(scrollTop / estimatedItemSize) - overscan,
        0,
      );
      const fallbackEndIndex = Math.min(
        Math.ceil((scrollTop + viewportHeight) / estimatedItemSize) + overscan,
        count,
      );

      return Array.from(
        { length: Math.max(fallbackEndIndex - fallbackStartIndex, 0) },
        (_, offset) => {
          const index = fallbackStartIndex + offset;
          const size = resolvedEstimateSize(index);
          return {
            end: (index + 1) * estimatedItemSize,
            index,
            key: index,
            lane: 0,
            size,
            start: index * estimatedItemSize,
          };
        },
      );
    },
    [count, estimatedItemSize, overscan, resolvedEstimateSize],
  );

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) {
      return undefined;
    }

    const syncFallbackRange = () => {
      const nextRange = {
        scrollTop: scrollElement.scrollTop,
        viewportHeight:
          scrollElement.clientHeight > 0
            ? scrollElement.clientHeight
            : DEFAULT_VIEWPORT_HEIGHT,
      };
      setFallbackRange((previousRange) => {
        if (
          previousRange.scrollTop === nextRange.scrollTop &&
          previousRange.viewportHeight === nextRange.viewportHeight
        ) {
          return previousRange;
        }
        return nextRange;
      });
    };

    syncFallbackRange();
    scrollElement.addEventListener('scroll', syncFallbackRange, {
      passive: true,
    });
    window.addEventListener('resize', syncFallbackRange);

    return () => {
      scrollElement.removeEventListener('scroll', syncFallbackRange);
      window.removeEventListener('resize', syncFallbackRange);
    };
  }, [scrollElementRef]);

  const virtualItems = virtualizer.getVirtualItems();
  const fallbackVirtualItems: VirtualItem[] =
    virtualItems.length === 0 && count > 0
      ? getFallbackVirtualItems(
          fallbackRange.scrollTop,
          fallbackRange.viewportHeight,
        )
      : [];
  const activeVirtualItems =
    virtualItems.length > 0 ? virtualItems : fallbackVirtualItems;
  const totalSize = Math.max(
    virtualizer.getTotalSize(),
    count * estimatedItemSize,
  );

  // Scroll events alone are not enough to drive loading: the first page may
  // not fill the container (no scroll possible) and appended pages can leave
  // the viewport still at the end. Re-check on every relevant state change.
  useEffect(() => {
    maybeLoadMore(activeVirtualItems);
  });

  const measureElement = useMemo(() => {
    if (!dynamicRowHeight || isFirefox) {
      return undefined;
    }
    return (node: HTMLElement | null) => {
      if (!node) {
        return;
      }
      virtualizer.measureElement(node);
    };
  }, [dynamicRowHeight, isFirefox, virtualizer]);

  const retry = useCallback(() => {
    if (!onLoadMore || isFetchingNextPage || !hasNextPage) {
      return;
    }
    onLoadMore();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const scrollToTop = useCallback(() => {
    virtualizer.scrollToOffset(0);
  }, [virtualizer]);

  const scrollToIndex = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index);
    },
    [virtualizer],
  );

  return {
    measureElement,
    retry,
    scrollElementRef,
    scrollToIndex,
    scrollToTop,
    totalSize,
    virtualItems: activeVirtualItems,
    virtualizer,
  };
};

export default useInfiniteVirtualizer;
