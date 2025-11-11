import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useIsInitialRenderCycle } from './useIsInitialRenderCycle';

describe('useIsInitialRenderCycle', () => {
  it('should return true on initial render', () => {
    const { result } = renderHook(() => useIsInitialRenderCycle());
    expect(result.current).toBe(true);
  });

  it('should return false after first render', () => {
    const { result, rerender } = renderHook(() => useIsInitialRenderCycle());

    // Initial render
    expect(result.current).toBe(true);

    // Trigger re-render
    rerender();

    // Should now be false
    expect(result.current).toBe(false);
  });

  it('should remain false on subsequent re-renders', () => {
    const { result, rerender } = renderHook(() => useIsInitialRenderCycle());

    // Initial render
    expect(result.current).toBe(true);

    // First re-render
    rerender();
    expect(result.current).toBe(false);

    // Second re-render
    rerender();
    expect(result.current).toBe(false);

    // Third re-render
    rerender();
    expect(result.current).toBe(false);
  });

  it('should reset to true when component is remounted', () => {
    const { result, rerender, unmount } = renderHook(() =>
      useIsInitialRenderCycle(),
    );

    // Initial render
    expect(result.current).toBe(true);

    // Re-render
    rerender();
    expect(result.current).toBe(false);

    // Unmount
    unmount();

    // Remount by creating a new hook instance
    const { result: result2 } = renderHook(() => useIsInitialRenderCycle());
    expect(result2.current).toBe(true);
  });
});
