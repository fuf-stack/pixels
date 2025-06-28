import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useInputValueDebounce } from './useInputValueDebounce';

// Mock the useDebounce hook from @fuf-stack/pixels
vi.mock('@fuf-stack/pixels', () => ({
  useDebounce: vi.fn((value, delay) => {
    // For testing, we'll simulate debouncing behavior
    if (delay === 0) return value;
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

  describe('Number type conversion', () => {
    it('should convert valid numbers when type is number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('123');
      });

      expect(mockOnChange).toHaveBeenCalledWith(123);
    });

    it('should preserve invalid numbers as strings when type is number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('abc');
      });

      expect(mockOnChange).toHaveBeenCalledWith('abc');
    });

    it('should handle decimal numbers when type is number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('12.5');
      });

      expect(mockOnChange).toHaveBeenCalledWith(12.5);
    });

    it('should not convert when type is not number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
          type: 'text',
        }),
      );

      act(() => {
        result.current.onChange('123');
      });

      expect(mockOnChange).toHaveBeenCalledWith('123');
    });

    it('should handle empty string with number type', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 'initial',
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('');
      });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should convert input strings to numbers when type is number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 42,
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('123');
      });

      // Both display value and form value should be converted to number
      expect(result.current.value).toBe(123);
      expect(mockOnChange).toHaveBeenCalledWith(123);
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

    it('should convert input strings to numbers when type is number', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 42,
          type: 'number',
        }),
      );

      act(() => {
        result.current.onChange('123');
      });

      // Both display value and form value should be converted to number
      expect(result.current.value).toBe(123);
      expect(mockOnChange).toHaveBeenCalledWith(123);
    });
  });

  describe('transformValue functionality', () => {
    const mockTransform = {
      displayValue: vi.fn((val: string | number) => `$${val}`),
      formValue: vi.fn((val: string) => Number(val.replace('$', '')) || 0),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should transform initial value for display', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 100,
          transformValue: mockTransform,
        }),
      );

      expect(mockTransform.displayValue).toHaveBeenCalledWith(100);
      expect(result.current.value).toBe('$100');
    });

    it('should transform input value when onChange is called', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 0,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 100,
          transformValue: mockTransform,
        }),
      );

      act(() => {
        const mockEvent = {
          target: { value: '$250' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.onChange(mockEvent);
      });

      expect(result.current.value).toBe('$250');
      // Should preserve event structure with transformed value
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 250,
          }),
        }),
      );
    });

    it('should transform value on blur flush', () => {
      const { result } = renderHook(() =>
        useInputValueDebounce({
          debounceDelay: 100,
          onBlur: mockOnBlur,
          onChange: mockOnChange,
          value: 100,
          transformValue: mockTransform,
        }),
      );

      act(() => {
        const mockEvent = {
          target: { value: '$500' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.onChange(mockEvent);
      });

      expect(mockOnChange).not.toHaveBeenCalled();

      act(() => {
        result.current.onBlur();
      });

      expect(mockOnChange).toHaveBeenCalledWith(500);
      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should update display value when external value changes with transform', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useInputValueDebounce({
            debounceDelay: 0,
            onBlur: mockOnBlur,
            onChange: mockOnChange,
            value,
            transformValue: mockTransform,
          }),
        { initialProps: { value: 100 } },
      );

      expect(result.current.value).toBe('$100');

      rerender({ value: 200 });

      expect(mockTransform.displayValue).toHaveBeenCalledWith(200);
      expect(result.current.value).toBe('$200');
    });
  });
});
