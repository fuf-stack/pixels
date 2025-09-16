import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useInputValueTransform } from './useInputValueTransform';

describe('useInputValueTransform', () => {
  describe('Basic functionality', () => {
    it('should provide conversion utilities', () => {
      const { result } = renderHook(() => useInputValueTransform({}));

      expect(result.current.toDisplayValue).toBeTypeOf('function');
      expect(result.current.toFormValue).toBeTypeOf('function');
    });

    it('should convert form values to display values', () => {
      const { result } = renderHook(() => useInputValueTransform({}));

      expect(result.current.toDisplayValue('hello')).toBe('hello');
      expect(result.current.toDisplayValue(123)).toBe(123);
      expect(result.current.toDisplayValue('')).toBe('');
    });

    it('should convert display values to form values', () => {
      const { result } = renderHook(() => useInputValueTransform({}));

      expect(result.current.toFormValue('hello')).toBe('hello');
      expect(result.current.toFormValue(123)).toBe(123);
      expect(result.current.toFormValue('')).toBe('');
    });
  });

  describe('Number type handling', () => {
    it('should convert strings to numbers for number type display values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ type: 'number' }),
      );

      expect(result.current.toDisplayValue('123')).toBe(123);
      expect(result.current.toDisplayValue('3.14')).toBe(3.14);
      expect(result.current.toDisplayValue('')).toBe('');
      expect(result.current.toDisplayValue('abc')).toBe('abc'); // Invalid numbers preserved
    });

    it('should convert display values to numbers for form values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ type: 'number' }),
      );

      expect(result.current.toFormValue('123')).toBe(123);
      expect(result.current.toFormValue('3.14')).toBe(3.14);
      expect(result.current.toFormValue('')).toBe('');
      expect(result.current.toFormValue('abc')).toBe('abc'); // Invalid numbers preserved
    });

    it('should handle numeric display values correctly', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({ type: 'number' }),
      );

      expect(result.current.toFormValue(123)).toBe(123);
      expect(result.current.toFormValue(3.14)).toBe(3.14);
    });
  });

  describe('Transform functions', () => {
    const currencyTransform = {
      toDisplayValue: (val: string | number) =>
        val ? `$${Number(val).toLocaleString()}` : '',
      toFormValue: (val: string) => parseFloat(val.replace(/[$,]/g, '')) || 0,
    };

    it('should apply display transform to form values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toDisplayValue(1000)).toBe('$1,000');
      expect(result.current.toDisplayValue(1234.56)).toBe('$1,234.56');
      expect(result.current.toDisplayValue('')).toBe('');
    });

    it('should apply form transform to display values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toFormValue('$1,000')).toBe(1000);
      expect(result.current.toFormValue('$1,234.56')).toBe(1234.56);
      expect(result.current.toFormValue('')).toBe(0);
    });

    const phoneTransform = {
      toDisplayValue: (val: string | number) => {
        const cleaned = val.toString().replace(/\D/g, '');
        const match = /^(\d{3})(\d{3})(\d{4})$/.exec(cleaned);
        return match ? `(${match[1]}) ${match[2]}-${match[3]}` : val;
      },
      toFormValue: (val: string) => val.replace(/\D/g, ''),
    };

    it('should handle phone number transforms', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: phoneTransform,
        }),
      );

      expect(result.current.toDisplayValue('5551234567')).toBe(
        '(555) 123-4567',
      );
      expect(result.current.toFormValue('(555) 123-4567')).toBe('5551234567');
    });

    it('should handle transforms with empty values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toDisplayValue('')).toBe('');
      expect(result.current.toFormValue('')).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', () => {
      const { result } = renderHook(() => useInputValueTransform({}));

      expect(
        result.current.toDisplayValue(null as unknown as string | number),
      ).toBe('');
      expect(
        result.current.toFormValue(null as unknown as string | number),
      ).toBe(null);
    });

    it('should handle transforms that return null/undefined', () => {
      const nullTransform = {
        toDisplayValue: () => null as unknown as string | number,
        toFormValue: () => undefined as unknown as string | number,
      };

      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: nullTransform,
        }),
      );

      expect(result.current.toDisplayValue('test')).toBe(null);
      expect(result.current.toFormValue('test')).toBe(undefined);
    });

    it('should handle complex transformation errors gracefully', () => {
      const errorTransform = {
        toDisplayValue: (val: string | number) => {
          if (val === 'error') throw new Error('Transform error');
          return val;
        },
        toFormValue: (val: string) => val,
      };

      const { result } = renderHook(() =>
        useInputValueTransform({
          transform: errorTransform,
        }),
      );

      expect(() => {
        result.current.toDisplayValue('error');
      }).toThrow('Transform error');
    });
  });

  describe('Function stability', () => {
    it('should maintain function references between renders', () => {
      const { result, rerender } = renderHook(() =>
        useInputValueTransform({ type: 'number' }),
      );

      const firstRender = {
        toDisplayValue: result.current.toDisplayValue,
        toFormValue: result.current.toFormValue,
      };

      rerender();

      expect(result.current.toDisplayValue).toBe(firstRender.toDisplayValue);
      expect(result.current.toFormValue).toBe(firstRender.toFormValue);
    });

    it('should update functions when dependencies change', () => {
      let type: 'text' | 'number' = 'text';
      const { result, rerender } = renderHook(() =>
        useInputValueTransform({ type }),
      );

      const firstRender = result.current.toDisplayValue;

      type = 'number';
      rerender();

      expect(result.current.toDisplayValue).not.toBe(firstRender);
    });
  });
});
