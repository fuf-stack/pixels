/* eslint-disable n/no-unsupported-features/node-builtins */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value'),
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('should return value from localStorage if it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value'),
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value is set', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value'),
    );

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should work with function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem('test-key')).toBe('15');
  });

  it('should work with different data types', () => {
    // String
    const { result: stringResult } = renderHook(() =>
      useLocalStorage('string-key', 'hello'),
    );
    expect(stringResult.current[0]).toBe('hello');

    // Number
    const { result: numberResult } = renderHook(() =>
      useLocalStorage('number-key', 42),
    );
    expect(numberResult.current[0]).toBe(42);

    // Boolean
    const { result: boolResult } = renderHook(() =>
      useLocalStorage('bool-key', true),
    );
    expect(boolResult.current[0]).toBe(true);

    // Object
    const testObj = { id: 1, name: 'test' };
    const { result: objResult } = renderHook(() =>
      useLocalStorage('obj-key', testObj),
    );
    expect(objResult.current[0]).toEqual(testObj);

    // Array
    const testArr = [1, 2, 3];
    const { result: arrResult } = renderHook(() =>
      useLocalStorage('arr-key', testArr),
    );
    expect(arrResult.current[0]).toEqual(testArr);
  });

  it('should work with initial value as function', () => {
    const initialValueFn = vi.fn(() => 'computed-value');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', initialValueFn),
    );

    expect(result.current[0]).toBe('computed-value');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // Mock localStorage.getItem to throw error
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback'),
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error),
    );
  });

  it('should handle JSON parse errors gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // Set invalid JSON in localStorage
    localStorage.setItem('test-key', 'invalid-json{');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback'),
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error),
    );
  });

  it('should dispatch custom local-storage event on setValue', () => {
    const eventSpy = vi.fn();
    window.addEventListener('local-storage', eventSpy);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener('local-storage', eventSpy);
  });

  it('should sync across multiple hooks with same key', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial'),
    );

    const { result: result2 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial'),
    );

    // Update first hook
    act(() => {
      result1.current[1]('updated');
    });

    // Both hooks should have the updated value
    expect(result1.current[0]).toBe('updated');
    expect(result2.current[0]).toBe('updated');

    // localStorage should be updated
    expect(localStorage.getItem('shared-key')).toBe(JSON.stringify('updated'));
  });

  // Note: We cannot test the "window is undefined" scenario using renderHook
  // because React DOM itself requires window to be defined for rendering.
  // The hook properly handles SSR by checking typeof window === 'undefined'
  // in the setValue function and useEffect hooks.
  it.skip('should handle setValue when window is undefined', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // Mock window as undefined
    const originalWindow = global.window;
    // @ts-expect-error - intentionally setting to undefined for test
    delete global.window;

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Tried setting localStorage key "test-key" even though environment is not a client',
    );

    // Restore window
    global.window = originalWindow;
  });
});
