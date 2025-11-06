import { describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
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

  it('should update immediately when disabled is true', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500, true),
      {
        initialProps: { value: 'initial' },
      },
    );

    expect(result.current).toBe('initial');

    // Update value with disabled=true
    rerender({ value: 'updated' });

    // Should update immediately
    expect(result.current).toBe('updated');
  });

  it('should handle changing from disabled to enabled', async () => {
    const { result, rerender } = renderHook(
      ({ value, disabled }) => useDebounce(value, 500, disabled),
      {
        initialProps: { value: 'initial', disabled: true },
      },
    );

    expect(result.current).toBe('initial');

    // Update with disabled=true - should be immediate
    rerender({ value: 'updated1', disabled: true });
    expect(result.current).toBe('updated1');

    // Update with disabled=false - should debounce
    rerender({ value: 'updated2', disabled: false });
    expect(result.current).toBe('updated1'); // Still old value

    await waitFor(
      () => {
        expect(result.current).toBe('updated2');
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
