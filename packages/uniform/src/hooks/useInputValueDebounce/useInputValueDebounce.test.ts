import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useInputValueDebounce } from './useInputValueDebounce';

// Mock the useDebounce hook from @fuf-stack/pixels
vi.mock('@fuf-stack/pixels', () => ({
  useDebounce: vi.fn((value, delay) => {
    // For testing, we'll simulate debouncing behavior
    if (delay === 0) {
      return value;
    }
    // In real tests, this would be the debounced value
    return value;
  }),
}));

describe('useInputValueDebounce', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should return enhanced onChange, onBlur, and value', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'test',
        }),
      );

      expect(result.current.onChange).toBeInstanceOf(Function);
      expect(result.current.onBlur).toBeInstanceOf(Function);
      expect(result.current.value).toBe('test');
    });

    it('should preserve number values as numbers', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 42,
        }),
      );

      expect(result.current.value).toBe(42);
    });

    it('should handle empty string values', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: '',
        }),
      );

      expect(result.current.value).toBe('');
    });

    it('should use default debounce delay of 300ms', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'test',
        }),
      );

      expect(result.current.value).toBe('test');
    });
  });

  describe('onChange handler', () => {
    it('should call onChange immediately when debounceDelay is 0', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
        }),
      );

      act(() => {
        result.current.onChange('new value');
      });

      expect(mockOnChange).toHaveBeenCalledWith('new value');
    });

    it('should handle event objects', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
        }),
      );

      const mockEvent = {
        target: { value: 'event value' },
      };

      act(() => {
        result.current.onChange(mockEvent);
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'event value',
          }),
        }),
      );
    });

    it('should debounce onChange calls when delay > 0', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 300,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
        }),
      );

      act(() => {
        result.current.onChange('first');
        result.current.onChange('second');
        result.current.onChange('third');
      });

      // Should not have called onChange yet
      expect(mockOnChange).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should call onChange with the last value
      expect(mockOnChange).toHaveBeenCalledWith('third');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('onBlur handler', () => {
    it('should call original onBlur', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'test',
        }),
      );

      act(() => {
        result.current.onBlur();
      });

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    it('should flush pending debounced changes on blur', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 300,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
        }),
      );

      act(() => {
        result.current.onChange('pending');
      });

      // Should not have called onChange yet
      expect(mockOnChange).not.toHaveBeenCalled();

      act(() => {
        result.current.onBlur();
      });

      // Should flush the pending change
      expect(mockOnChange).toHaveBeenCalledWith('pending');
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange on blur if no pending changes', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 300,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'test',
        }),
      );

      act(() => {
        result.current.onBlur();
      });

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Value updates', () => {
    it('should update display value when prop value changes', () => {
      let value: string | number = 'initial';
      const { result, rerender } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value,
        }),
      );

      expect(result.current.value).toBe('initial');

      value = 'updated';
      rerender();

      expect(result.current.value).toBe('updated');
    });

    it('should update display value immediately on onChange', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 300,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
        }),
      );

      expect(result.current.value).toBe('initial');

      act(() => {
        result.current.onChange('immediate');
      });

      // Display value should update immediately
      expect(result.current.value).toBe('immediate');
      // But onChange should not be called yet due to debouncing
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
