import type { Row } from '@tanstack/react-table';
import type { VirtualItem } from '@tanstack/react-virtual';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useInfiniteVirtualizer } from '../../hooks/useInfiniteVirtualizer';
import {
  getDataTableVirtualItems,
  useDataTableVirtualizer,
} from './useDataTableVirtualizer';

vi.mock('../../hooks/useInfiniteVirtualizer', () => ({
  useInfiniteVirtualizer: vi.fn(),
}));

interface TestRow {
  id: string;
}

const makeRow = (id: string, expanded = false) =>
  ({
    id,
    getIsExpanded: () => expanded,
  }) as unknown as Row<TestRow>;

const makeVirtualItem = (index: number): VirtualItem => ({
  end: (index + 1) * 45,
  index,
  key: index,
  lane: 0,
  size: 45,
  start: index * 45,
});

describe('getDataTableVirtualItems', () => {
  it('returns one row item per loaded row by default', () => {
    const items = getDataTableVirtualItems({
      rows: [makeRow('0'), makeRow('1')],
    });

    expect(items).toEqual([
      expect.objectContaining({ key: 'row-0', kind: 'row' }),
      expect.objectContaining({ key: 'row-1', kind: 'row' }),
    ]);
  });

  it('adds expanded sibling items when renderContent is configured', () => {
    const items = getDataTableVirtualItems({
      expandableRows: {
        renderContent: () => null,
      },
      rows: [makeRow('0', true), makeRow('1', false)],
    });

    expect(items.map((item) => item.kind)).toEqual(['row', 'expanded', 'row']);
    expect(items[1]).toEqual(
      expect.objectContaining({
        key: 'expanded-0',
        kind: 'expanded',
      }),
    );
  });

  it('adds placeholders and load-more sentinel in total-count mode', () => {
    const items = getDataTableVirtualItems({
      infiniteScroll: {
        onLoadMore: () => undefined,
        pageInfo: {
          endCursor: 'cursor-2',
          hasNextPage: true,
          totalCount: 5,
        },
        scrollbarMode: 'total-count',
      },
      rows: [makeRow('0'), makeRow('1')],
    });

    expect(items.map((item) => item.kind)).toEqual([
      'row',
      'row',
      'placeholder',
      'placeholder',
      'placeholder',
      'load-more',
    ]);
  });

  it('creates placeholders from index 0 when total-count has no loaded rows', () => {
    const items = getDataTableVirtualItems({
      infiniteScroll: {
        onLoadMore: () => undefined,
        pageInfo: {
          hasNextPage: false,
          totalCount: 3,
        },
        scrollbarMode: 'total-count',
      },
      rows: [],
    });

    expect(items.map((item) => item.kind)).toEqual([
      'placeholder',
      'placeholder',
      'placeholder',
    ]);
  });
});

describe('useDataTableVirtualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInfiniteVirtualizer).mockReturnValue({
      measureElement: undefined,
      retry: vi.fn(),
      scrollElementRef: { current: null },
      scrollToIndex: vi.fn(),
      scrollToTop: vi.fn(),
      totalSize: 100,
      virtualItems: [makeVirtualItem(0)],
      virtualizer: {} as never,
    });
  });

  it('passes loadedCount and cursor-forward onLoadMore mapping to shared hook', () => {
    const onLoadMore = vi.fn();

    renderHook(() =>
      useDataTableVirtualizer({
        infiniteScroll: {
          onLoadMore,
          pageInfo: {
            endCursor: 'cursor-1',
            hasNextPage: true,
            totalCount: 10,
          },
        },
        rows: [makeRow('0')],
      }),
    );

    const params = vi.mocked(useInfiniteVirtualizer).mock.calls[0]?.[0];
    expect(params?.loadedCount).toBe(1);

    params?.onLoadMore?.();
    expect(onLoadMore).toHaveBeenCalledWith({
      cursor: 'cursor-1',
      direction: 'forward',
    });
  });

  it('triggers shouldLoadMore when placeholders are in visible range', () => {
    renderHook(() =>
      useDataTableVirtualizer({
        infiniteScroll: {
          onLoadMore: () => undefined,
          pageInfo: {
            hasNextPage: true,
            totalCount: 10,
          },
          scrollbarMode: 'total-count',
        },
        rows: [makeRow('0')],
      }),
    );

    const params = vi.mocked(useInfiniteVirtualizer).mock.calls[0]?.[0];
    const shouldLoad = params?.shouldLoadMore?.({
      loadMoreThreshold: 5,
      virtualItems: [makeVirtualItem(2)],
    });
    expect(shouldLoad).toBe(true);
  });
});
