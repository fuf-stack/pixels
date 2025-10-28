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
      toDisplayValue: (val: unknown) =>
        val ? `$${Number(val).toLocaleString()}` : '',
      toFormValue: (val: string) => parseFloat(val.replace(/[$,]/g, '')) || 0,
    };

    it('should apply display transform to form values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toDisplayValue(1000)).toBe('$1,000');
      expect(result.current.toDisplayValue(1234.56)).toBe('$1,234.56');
      expect(result.current.toDisplayValue(0)).toBe('');
    });

    it('should apply form transform to display values', () => {
      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toFormValue('$1,000')).toBe(1000);
      expect(result.current.toFormValue('$1,234.56')).toBe(1234.56);
      expect(result.current.toFormValue('')).toBe(0);
    });

    const phoneTransform = {
      toDisplayValue: (val: unknown) => {
        const cleaned = String(val).replace(/\D/g, '');
        const match = /^(\d{3})(\d{3})(\d{4})$/.exec(cleaned);
        return match ? `(${match[1]}) ${match[2]}-${match[3]}` : String(val);
      },
      toFormValue: (val: string) => val.replace(/\D/g, ''),
    };

    it('should handle phone number transforms', () => {
      const { result } = renderHook(() =>
        useInputValueTransform<string>({
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
        useInputValueTransform<string>({
          transform: currencyTransform,
        }),
      );

      expect(result.current.toDisplayValue(0)).toBe('');
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
        toDisplayValue: (val: unknown) => {
          if (val === 'error') {
            throw new Error('Transform error');
          }
          return String(val);
        },
        toFormValue: (val: string) => val,
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
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

  describe('Generic type support - Arrays', () => {
    it('should handle array to single value transforms', () => {
      const singleValueTransform = {
        toDisplayValue: (val: unknown) => (val as string[])?.[0] || '',
        toFormValue: (val: string) => (val ? [val] : []),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: singleValueTransform,
        }),
      );

      expect(result.current.toDisplayValue(['option1', 'option2'])).toBe(
        'option1',
      );
      expect(result.current.toDisplayValue([])).toBe('');
      expect(result.current.toFormValue('option1')).toEqual(['option1']);
      expect(result.current.toFormValue('')).toEqual([]);
    });

    it('should handle single value to array transforms', () => {
      const arrayTransform = {
        toDisplayValue: (val: unknown) => (val ? [val as string] : []),
        toFormValue: (val: string[]) => val[0] || '',
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string[]>({
          transform: arrayTransform,
        }),
      );

      expect(result.current.toDisplayValue('option1')).toEqual(['option1']);
      expect(result.current.toDisplayValue('')).toEqual([]);
      expect(result.current.toFormValue(['option1', 'option2'])).toBe(
        'option1',
      );
      expect(result.current.toFormValue([])).toBe('');
    });

    it('should handle array passthrough without transform', () => {
      const { result } = renderHook(() => useInputValueTransform<string[]>({}));

      const testArray = ['item1', 'item2', 'item3'];
      expect(result.current.toDisplayValue(testArray)).toEqual(testArray);
      expect(result.current.toFormValue(testArray)).toEqual(testArray);
    });

    it('should transform array elements individually', () => {
      const uppercaseTransform = {
        toDisplayValue: (val: unknown) =>
          (val as string[]).map((v) => v.toUpperCase()),
        toFormValue: (val: string[]) => val.map((v) => v.toLowerCase()),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string[]>({
          transform: uppercaseTransform,
        }),
      );

      expect(result.current.toDisplayValue(['hello', 'world'])).toEqual([
        'HELLO',
        'WORLD',
      ]);
      expect(result.current.toFormValue(['HELLO', 'WORLD'])).toEqual([
        'hello',
        'world',
      ]);
    });
  });

  describe('Generic type support - Objects', () => {
    interface User {
      id: number;
      name: string;
    }

    it('should handle object to string transforms', () => {
      const objectToStringTransform = {
        toDisplayValue: (user: unknown) => (user as User).name,
        toFormValue: (name: string) => ({ id: 0, name }),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: objectToStringTransform,
        }),
      );

      expect(result.current.toDisplayValue({ id: 1, name: 'John' })).toBe(
        'John',
      );
      expect(result.current.toFormValue('Jane')).toEqual({
        id: 0,
        name: 'Jane',
      });
    });

    it('should handle object passthrough without transform', () => {
      const { result } = renderHook(() => useInputValueTransform<User>({}));

      const user = { id: 1, name: 'John' };
      expect(result.current.toDisplayValue(user)).toEqual(user);
      expect(result.current.toFormValue(user)).toEqual(user);
    });

    it('should transform object properties', () => {
      interface FormData {
        firstName: string;
        lastName: string;
      }

      interface DisplayData {
        fullName: string;
      }

      const nameTransform = {
        toDisplayValue: (form: unknown) => {
          const f = form as FormData;
          return {
            fullName: `${f.firstName} ${f.lastName}`,
          };
        },
        toFormValue: (display: DisplayData) => {
          const [firstName, ...rest] = display.fullName.split(' ');
          return { firstName, lastName: rest.join(' ') || '' };
        },
      };

      const { result } = renderHook(() =>
        useInputValueTransform<DisplayData>({
          transform: nameTransform,
        }),
      );

      expect(
        result.current.toDisplayValue({ firstName: 'John', lastName: 'Doe' }),
      ).toEqual({ fullName: 'John Doe' });
      expect(result.current.toFormValue({ fullName: 'Jane Smith' })).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
      });
    });
  });

  describe('Generic type support - Complex structures', () => {
    interface TodoItem {
      id: string;
      text: string;
      completed: boolean;
    }

    it('should handle array of objects transforms', () => {
      const todoTransform = {
        toDisplayValue: (todos: unknown) =>
          (todos as TodoItem[]).map((t) => ({
            ...t,
            text: t.text.toUpperCase(),
          })),
        toFormValue: (todos: TodoItem[]) =>
          todos.map((t) => ({ ...t, text: t.text.toLowerCase() })),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<TodoItem[]>({
          transform: todoTransform,
        }),
      );

      const inputTodos = [
        { id: '1', text: 'hello', completed: false },
        { id: '2', text: 'world', completed: true },
      ];

      const displayResult = result.current.toDisplayValue(inputTodos);
      expect(displayResult).toEqual([
        { id: '1', text: 'HELLO', completed: false },
        { id: '2', text: 'WORLD', completed: true },
      ]);

      const formResult = result.current.toFormValue(displayResult);
      expect(formResult).toEqual(inputTodos);
    });

    it('should handle nested object transforms', () => {
      interface Address {
        street: string;
        city: string;
      }

      interface PersonForm {
        name: string;
        address: Address;
      }

      interface PersonDisplay {
        fullAddress: string;
      }

      const addressTransform = {
        toDisplayValue: (person: unknown) => {
          const p = person as PersonForm;
          return {
            fullAddress: `${p.name}, ${p.address.street}, ${p.address.city}`,
          };
        },
        toFormValue: (display: PersonDisplay) => {
          const parts = display.fullAddress.split(', ');
          return {
            name: parts[0] || '',
            address: {
              street: parts[1] || '',
              city: parts[2] || '',
            },
          };
        },
      };

      const { result } = renderHook(() =>
        useInputValueTransform<PersonDisplay>({
          transform: addressTransform,
        }),
      );

      const person = {
        name: 'John',
        address: { street: '123 Main St', city: 'Boston' },
      };

      expect(result.current.toDisplayValue(person)).toEqual({
        fullAddress: 'John, 123 Main St, Boston',
      });

      expect(
        result.current.toFormValue({ fullAddress: 'Jane, 456 Oak Ave, NYC' }),
      ).toEqual({
        name: 'Jane',
        address: { street: '456 Oak Ave', city: 'NYC' },
      });
    });

    it('should handle mixed type transforms (number array to comma string)', () => {
      const numberArrayTransform = {
        toDisplayValue: (nums: unknown) => (nums as number[]).join(', '),
        toFormValue: (str: string) =>
          str
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s)
            .map(Number)
            .filter((n) => !Number.isNaN(n)),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: numberArrayTransform,
        }),
      );

      expect(result.current.toDisplayValue([1, 2, 3, 4])).toBe('1, 2, 3, 4');
      expect(result.current.toFormValue('5, 6, 7, 8')).toEqual([5, 6, 7, 8]);
      expect(result.current.toFormValue('1, abc, 3')).toEqual([1, 3]);
    });
  });

  describe('Generic type support - Real-world scenarios', () => {
    it('should handle checkbox group single value scenario', () => {
      // Form stores single value, checkbox group needs array
      const checkboxTransform = {
        toDisplayValue: (val: unknown) => (val ? [val as string] : []),
        toFormValue: (val: string[]) => val[0] || undefined,
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string[]>({
          transform: checkboxTransform,
        }),
      );

      expect(result.current.toDisplayValue('option1')).toEqual(['option1']);
      expect(result.current.toDisplayValue(undefined)).toEqual([]);
      expect(result.current.toFormValue(['option1'])).toBe('option1');
      expect(result.current.toFormValue([])).toBe(undefined);
    });

    it('should handle tags input scenario (array to comma-separated string)', () => {
      const tagsTransform = {
        toDisplayValue: (tags: unknown) => (tags as string[]).join(', '),
        toFormValue: (str: string) =>
          str
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: tagsTransform,
        }),
      );

      expect(
        result.current.toDisplayValue(['react', 'typescript', 'vitest']),
      ).toBe('react, typescript, vitest');
      expect(result.current.toFormValue('vue, javascript, jest')).toEqual([
        'vue',
        'javascript',
        'jest',
      ]);
    });

    it('should handle JSON stringify/parse scenario', () => {
      interface Config {
        theme: string;
        locale: string;
      }

      const jsonTransform = {
        toDisplayValue: (obj: unknown) => JSON.stringify(obj, null, 2),
        toFormValue: (str: string) => {
          try {
            return JSON.parse(str) as Config;
          } catch {
            return { theme: 'light', locale: 'en' };
          }
        },
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string>({
          transform: jsonTransform,
        }),
      );

      const config = { theme: 'dark', locale: 'de' };
      const displayValue = result.current.toDisplayValue(config);
      expect(displayValue).toContain('"theme": "dark"');
      expect(displayValue).toContain('"locale": "de"');

      const formValue = result.current.toFormValue(
        '{"theme": "light", "locale": "fr"}',
      );
      expect(formValue).toEqual({ theme: 'light', locale: 'fr' });

      // Test error handling
      const fallback = result.current.toFormValue('invalid json');
      expect(fallback).toEqual({ theme: 'light', locale: 'en' });
    });

    it('should handle multi-select to set scenario', () => {
      const setTransform = {
        toDisplayValue: (set: unknown) => Array.from(set as Set<string>),
        toFormValue: (arr: string[]) => new Set(arr),
      };

      const { result } = renderHook(() =>
        useInputValueTransform<string[]>({
          transform: setTransform,
        }),
      );

      const testSet = new Set(['a', 'b', 'c']);
      const displayValue = result.current.toDisplayValue(testSet);
      expect(displayValue).toEqual(['a', 'b', 'c']);

      const formValue = result.current.toFormValue([
        'x',
        'y',
        'z',
      ]) as Set<string>;
      expect(formValue).toBeInstanceOf(Set);
      expect(formValue.has('x')).toBe(true);
      expect(formValue.has('y')).toBe(true);
      expect(formValue.has('z')).toBe(true);
    });
  });
});
