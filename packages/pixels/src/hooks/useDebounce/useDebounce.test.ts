import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { isTestEnvironment } from '@fuf-stack/pixel-utils';

import { useDebounce } from './useDebounce';

// Mock the isTestEnvironment function BEFORE any other imports
vi.mock('@fuf-stack/pixel-utils', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('@fuf-stack/pixel-utils')) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    isTestEnvironment: vi.fn(() => false), // Default to false for debounce tests
  };
});

describe('useDebounce', () => {
  beforeEach(() => {
    // Ensure mock returns false for all debounce tests by default
    vi.mocked(isTestEnvironment).mockClear();
    vi.mocked(isTestEnvironment).mockReturnValue(false);
  });

  it('should skip debouncing in test environments', () => {
    // Override to return true for this specific test
    vi.mocked(isTestEnvironment).mockReturnValue(true);

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      },
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // In test env, value should update immediately (no debounce)
    expect(result.current).toBe('updated');
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      },
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial immediately after update
    expect(result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 600 },
    );
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      },
    );

    // Rapid changes
    rerender({ value: 'change1' });
    rerender({ value: 'change2' });
    rerender({ value: 'final' });

    // Should still be initial immediately
    expect(result.current).toBe('initial');

    // Wait for debounce delay - should only see final value
    await waitFor(
      () => {
        expect(result.current).toBe('final');
      },
      { timeout: 600 },
    );
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('value', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should work with different value types', async () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } },
    );
    numberRerender({ value: 42 });
    await waitFor(() => expect(numberResult.current).toBe(42), {
      timeout: 200,
    });

    // Object
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: obj1 } },
    );
    objRerender({ value: obj2 });
    await waitFor(() => expect(objResult.current).toBe(obj2), { timeout: 200 });

    // Array
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: arr1 } },
    );
    arrRerender({ value: arr2 });
    await waitFor(() => expect(arrResult.current).toBe(arr2), { timeout: 200 });
  });
});
