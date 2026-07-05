import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useInfiniteVirtualizer } from './useInfiniteVirtualizer';

describe('useInfiniteVirtualizer', () => {
  it('does not auto-load when loadMoreError is true', () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteVirtualizer({
        count: 30,
        hasNextPage: true,
        loadMoreError: true,
        onLoadMore,
      }),
    );

    expect(onLoadMore).toHaveBeenCalledTimes(0);
  });

  it('retries manually when requested', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteVirtualizer({
        count: 30,
        hasNextPage: true,
        loadMoreError: true,
        onLoadMore,
      }),
    );

    result.current.retry();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
