import { describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useInputValueTransform } from './useInputValueTransform';

describe('useInputValueTransform', () => {
  describe('Basic functionality without transforms', () => {
    it('should return the provided value as displayValue', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: 'test' }),
      );

      expect(result.current.displayValue).toBe('test');
    });

    it('should handle empty string value', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: '' }),
      );

      expect(result.current.displayValue).toBe('');
    });

    it('should handle numeric value', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: 42 }),
      );

      expect(result.current.displayValue).toBe(42);
    });

    it('should handle undefined value', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          value: undefined as unknown as string | number,
        }),
      );

      expect(result.current.displayValue).toBe('');
    });

    it('should return same value from getFormValue when no transforms', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: 'test' }),
      );

      expect(result.current.getFormValue()).toBe('test');
    });
  });

  describe('Number input handling', () => {
    it('should preserve empty string for number inputs', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: '', type: 'number' }),
      );

      expect(result.current.getFormValue()).toBe('');
    });

    it('should convert string to number for number inputs', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: '42', type: 'number' }),
      );

      act(() => {
        result.current.handleInputChange({
          target: { value: '123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.getFormValue()).toBe(123);
    });

    it('should handle decimal numbers', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: '3.14', type: 'number' }),
      );

      act(() => {
        result.current.handleInputChange({
          target: { value: '3.14' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.getFormValue()).toBe(3.14);
    });

    it('should handle zero value', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: '0', type: 'number' }),
      );

      act(() => {
        result.current.handleInputChange({
          target: { value: '0' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.getFormValue()).toBe(0);
    });
  });

  describe('Value transformations', () => {
    const currencyTransform = {
      displayValue: (val: string | number) =>
        val ? `$${Number(val).toLocaleString()}` : '',
      formValue: (val: string) => parseFloat(val.replace(/[$,]/g, '')) || 0,
    };

    it('should apply displayValue transform on initialization', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          value: 1000,
          transformValue: currencyTransform,
        }),
      );

      expect(result.current.displayValue).toBe('$1,000');
    });

    it('should apply formValue transform when getting form value', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          value: 1000,
          transformValue: currencyTransform,
        }),
      );

      expect(result.current.getFormValue()).toBe(1000);
    });

    it('should handle phone number formatting', () => {
      const phoneTransform = {
        displayValue: (val: string | number) => {
          const cleaned = val.toString().replace(/\D/g, '');
          const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
          return match ? `(${match[1]}) ${match[2]}-${match[3]}` : val;
        },
        formValue: (val: string) => val.replace(/\D/g, ''),
      };

      const { result } = renderHook(() =>
        useInputValueTransform({
          value: '5551234567',
          transformValue: phoneTransform,
        }),
      );

      expect(result.current.displayValue).toBe('(555) 123-4567');
      expect(result.current.getFormValue()).toBe('5551234567');
    });

    it('should handle transforms with empty values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          value: '',
          transformValue: currencyTransform,
        }),
      );

      expect(result.current.displayValue).toBe('');
      expect(result.current.getFormValue()).toBe(0);
    });
  });

  describe('handleInputChange', () => {
    it('should update displayValue when input changes', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: 'initial' }),
      );

      act(() => {
        result.current.handleInputChange({
          target: { value: 'updated' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.displayValue).toBe('updated');
    });

    it('should work with transforms', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          value: 1000,
          transformValue: {
            displayValue: (val) => val.toString(),
            formValue: (val) => parseFloat(val),
          },
        }),
      );

      act(() => {
        result.current.handleInputChange({
          target: { value: '2000' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.displayValue).toBe('2000');
      expect(result.current.getFormValue()).toBe(2000);
    });
  });

  describe('External value synchronization', () => {
    it('should update displayValue when external value changes', () => {
      let value = 'initial';
      const { result, rerender } = renderHook(() =>
        useInputValueTransform({ value }),
      );

      expect(result.current.displayValue).toBe('initial');

      value = 'external-update';
      rerender();

      expect(result.current.displayValue).toBe('external-update');
    });

    it('should apply transforms when external value changes', () => {
      let value = 1000;
      const { result, rerender } = renderHook(() =>
        useInputValueTransform({
          value,
          transformValue: {
            displayValue: (val) => `$${val}`,
            formValue: (val) => parseFloat(val.replace('$', '')),
          },
        }),
      );

      expect(result.current.displayValue).toBe('$1000');

      value = 2000;
      rerender();

      expect(result.current.displayValue).toBe('$2000');
    });

    it('should handle form resets (value becomes empty)', () => {
      let value: string | number = 'initial';
      const { result, rerender } = renderHook(() =>
        useInputValueTransform({ value }),
      );

      expect(result.current.displayValue).toBe('initial');

      value = '';
      rerender();

      expect(result.current.displayValue).toBe('');
    });

    it('should not update displayValue for same external value', () => {
      const displayValueSpy = vi.fn(
        (val: string | number) => `transformed-${val}`,
      );
      const transform = {
        displayValue: displayValueSpy,
        formValue: (val: string) => val.replace('transformed-', ''),
      };

      let value = 'test';
      const { rerender } = renderHook(() =>
        useInputValueTransform({ value, transformValue: transform }),
      );

      expect(displayValueSpy).toHaveBeenCalledTimes(1);

      // Same value - should not call transform again
      rerender();
      expect(displayValueSpy).toHaveBeenCalledTimes(1);

      // Different value - should call transform
      value = 'different';
      rerender();
      expect(displayValueSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: null as unknown as string | number }),
      );

      expect(result.current.displayValue).toBe('');
      expect(result.current.getFormValue()).toBe('');
    });

    it('should handle transforms that return null/undefined', () => {
      const nullTransform = {
        displayValue: () => null as unknown as string | number,
        formValue: () => undefined as unknown as string | number,
      };

      const { result } = renderHook(() =>
        useInputValueTransform({
          value: 'test',
          transformValue: nullTransform,
        }),
      );

      expect(result.current.displayValue).toBe(null);
      expect(result.current.getFormValue()).toBe(undefined);
    });

    it('should handle complex transformation errors gracefully', () => {
      const errorTransform = {
        displayValue: (val: string | number) => {
          if (val === 'error') throw new Error('Transform error');
          return val;
        },
        formValue: (val: string) => val,
      };

      expect(() => {
        renderHook(() =>
          useInputValueTransform({
            value: 'error',
            transformValue: errorTransform,
          }),
        );
      }).toThrow('Transform error');
    });
  });

  describe('Type consistency', () => {
    it('should maintain type consistency between calls', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ value: 42, type: 'number' }),
      );

      expect(typeof result.current.displayValue).toBe('number');
      expect(typeof result.current.getFormValue()).toBe('number');

      act(() => {
        result.current.handleInputChange({
          target: { value: '123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(typeof result.current.displayValue).toBe('string');
      expect(typeof result.current.getFormValue()).toBe('number');
    });
  });
});
