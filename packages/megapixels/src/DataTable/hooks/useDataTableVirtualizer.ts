import type { Row } from '@tanstack/react-table';
import type { VirtualItem } from '@tanstack/react-virtual';
import type { RefObject } from 'react';
import type {
  DataTableExpandableRowsFeature,
  DataTableInfiniteScrollFeature,
  DataTableVirtualizationFeature,
} from '../DataTable';

import { useMemo } from 'react';

import { useInfiniteVirtualizer } from '../../hooks/useInfiniteVirtualizer';

/**
 * Render units consumed by `DataTableVirtualBodyRows`.
 *
 * The virtualizer operates on a flat list, so table semantics (main row,
 * expanded detail row, placeholders, loading sentinel) are normalized into a
 * single ordered sequence.
 */
export type DataTableVirtualItem<TData> =
  | {
      key: string;
      kind: 'expanded';
      row: Row<TData>;
    }
  | {
      key: string;
      kind: 'load-more';
    }
  | {
      key: string;
      kind: 'placeholder';
      rowIndex: number;
    }
  | {
      key: string;
      kind: 'row';
      row: Row<TData>;
    };

/**
 * Flattens current table state into virtual render items.
 *
 * Ordering rules:
 * - each loaded row always produces a `row` item
 * - each expanded row optionally produces an adjacent `expanded` item
 * - `total-count` mode appends unloaded `placeholder` items after loaded rows
 * - infinite mode appends a trailing `load-more` sentinel when needed
 */
export const getDataTableVirtualItems = <TData>({
  expandableRows,
  infiniteScroll,
  rows,
}: {
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  infiniteScroll?: DataTableInfiniteScrollFeature;
  rows: Row<TData>[];
}): DataTableVirtualItem<TData>[] => {
  const nextItems: DataTableVirtualItem<TData>[] = [];

  rows.forEach((row, rowIndex) => {
    // Primary visible data row.
    nextItems.push({
      key: `row-${row.id}`,
      kind: 'row',
      row,
    });

    // Expanded detail is modeled as a sibling item so measurement remains
    // independent from the parent row.
    if (expandableRows?.renderContent && row.getIsExpanded()) {
      nextItems.push({
        key: `expanded-${row.id}`,
        kind: 'expanded',
        row,
      });
    }

    // Placeholders are only relevant when we reserve full scrollbar height.
    if (infiniteScroll?.scrollbarMode !== 'total-count') {
      return;
    }

    const isLastLoadedRow = rowIndex === rows.length - 1;
    if (!isLastLoadedRow) {
      return;
    }

    // Remaining unloaded rows are represented as placeholders.
    const placeholderCount = Math.max(
      infiniteScroll.pageInfo.totalCount - rows.length,
      0,
    );
    for (
      let placeholderOffset = 0;
      placeholderOffset < placeholderCount;
      placeholderOffset += 1
    ) {
      const placeholderIndex = rows.length + placeholderOffset;
      nextItems.push({
        key: `placeholder-${placeholderIndex}`,
        kind: 'placeholder',
        rowIndex: placeholderIndex,
      });
    }
  });

  if (rows.length === 0 && infiniteScroll?.scrollbarMode === 'total-count') {
    // Empty state in total-count mode still needs placeholders so users can
    // scroll and trigger loading.
    const placeholderCount = Math.max(infiniteScroll.pageInfo.totalCount, 0);
    for (
      let placeholderIndex = 0;
      placeholderIndex < placeholderCount;
      placeholderIndex += 1
    ) {
      nextItems.push({
        key: `placeholder-${placeholderIndex}`,
        kind: 'placeholder',
        rowIndex: placeholderIndex,
      });
    }
  }

  // Keep the loading/retry sentinel mounted while we can still move forward or
  // while a failed forward fetch needs manual retry.
  const shouldRenderLoadMoreItem = Boolean(
    infiniteScroll &&
    ((infiniteScroll.pageInfo.hasNextPage ?? false) ||
      (infiniteScroll.isFetchingNextPage ?? false) ||
      (infiniteScroll.loadMoreError ?? false)),
  );

  if (shouldRenderLoadMoreItem) {
    nextItems.push({
      key: 'load-more',
      kind: 'load-more',
    });
  }

  return nextItems;
};

/**
 * DataTable-specific adapter around the shared `useInfiniteVirtualizer`.
 *
 * Responsibilities:
 * - flatten table/expanded/placeholder/loading state into virtual items
 * - derive `loadedItemCount` used for duplicate-load guards
 * - translate generic load events back to cursor-based `onLoadMore`
 * - expose a `getItem(virtualItem)` lookup for row rendering
 */
export const useDataTableVirtualizer = <TData>({
  expandableRows,
  infiniteScroll,
  rows,
  scrollElementRef,
  virtualization,
}: {
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  infiniteScroll?: DataTableInfiniteScrollFeature;
  rows: Row<TData>[];
  scrollElementRef?: RefObject<HTMLDivElement | null>;
  virtualization?: DataTableVirtualizationFeature;
}) => {
  const virtualRows = useMemo(() => {
    return getDataTableVirtualItems({
      expandableRows,
      infiniteScroll,
      rows,
    });
  }, [expandableRows, infiniteScroll, rows]);

  const loadedItemCount = useMemo(() => {
    // `loadedItemCount` means "how many items are already materialized from
    // real data". It excludes placeholder and load-more items.
    //
    // This value is forwarded to the shared hook where it is used for request
    // deduplication between incremental page arrivals.
    const loadMoreIndex = virtualRows.findIndex((item) => {
      return item.kind === 'load-more';
    });
    if (loadMoreIndex >= 0) {
      return loadMoreIndex;
    }
    const placeholderIndex = virtualRows.findIndex((item) => {
      return item.kind === 'placeholder';
    });
    if (placeholderIndex >= 0) {
      return placeholderIndex;
    }
    return virtualRows.length;
  }, [virtualRows]);

  const virtualizer = useInfiniteVirtualizer({
    count: virtualRows.length,
    dynamicRowHeight:
      virtualization?.dynamicRowHeight ?? Boolean(infiniteScroll),
    enabled: Boolean(virtualization ?? infiniteScroll),
    estimateSize: () => {
      return virtualization?.estimateRowHeight ?? 45;
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
    overscan: virtualization?.overscan,
    scrollElementRef,
    shouldLoadMore: ({ loadMoreThreshold, virtualItems }) => {
      if (!infiniteScroll) {
        return false;
      }

      const kindsInRange = new Set(
        virtualItems.map((item) => {
          return virtualRows[item.index]?.kind;
        }),
      );

      // If the viewport already contains placeholders or the load-more row, we
      // should fetch immediately.
      if (kindsInRange.has('placeholder') || kindsInRange.has('load-more')) {
        return true;
      }

      // Otherwise prefetch shortly before the currently loaded tail enters the
      // viewport.
      const lastVirtualIndex =
        virtualItems[virtualItems.length - 1]?.index ?? 0;
      const prefetchBoundary = Math.max(
        loadedItemCount - loadMoreThreshold - 1,
        0,
      );
      return lastVirtualIndex >= prefetchBoundary;
    },
  });

  const getItem = (virtualItem: VirtualItem) => {
    // `VirtualItem.index` maps directly to our flattened item list.
    return virtualRows[virtualItem.index];
  };

  return {
    getItem,
    items: virtualRows,
    loadedItemCount,
    ...virtualizer,
  };
};

export default useDataTableVirtualizer;
