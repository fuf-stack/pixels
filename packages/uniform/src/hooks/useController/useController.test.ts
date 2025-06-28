import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useController as useRHFController } from 'react-hook-form';

import { renderHook } from '@testing-library/react';

import { fromNullishString, toNullishString } from '../../helpers';
import { useController } from './useController';

// Mock the helpers - we don't need to test their logic (that's in nullishFields.test.ts)
vi.mock('../../helpers', () => ({
  fromNullishString: vi.fn((value) => `fromNullish(${value})`),
  toNullishString: vi.fn((value) => `toNullish(${value})`),
}));

// Mock react-hook-form's useController
const mockField = {
  name: 'test-field' as const,
  value: 'mock-value',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
  disabled: false,
};

const mockFormState = {
  errors: {},
  isValid: true,
  isDirty: false,
  isLoading: false,
  isSubmitted: false,
  isSubmitting: false,
  isValidating: false,
  submitCount: 0,
  defaultValues: {},
  dirtyFields: {},
  touchedFields: {},
};

const mockFieldState = {
  invalid: false,
  isTouched: false,
  isDirty: false,
  error: undefined,
};

vi.mock('react-hook-form', () => ({
  useController: vi.fn(() => ({
    field: mockField,
    formState: mockFormState,
    fieldState: mockFieldState,
  })),
}));

type TestFormValues = {
  'test-field': string;
  email: string;
};

describe('useController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should call react-hook-form useController with provided props', () => {
      const props = {
        name: 'test-field' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        control: {} as any,
        rules: { required: true },
      };

      renderHook(() => useController<TestFormValues>(props));

      expect(useRHFController).toHaveBeenCalledWith(props);
    });

    it('should return field, formState, and fieldState', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      expect(result.current).toHaveProperty('field');
      expect(result.current).toHaveProperty('formState');
      expect(result.current).toHaveProperty('fieldState');
      expect(result.current.formState).toBe(mockFormState);
      expect(result.current.fieldState).toBe(mockFieldState);
    });

    it('should preserve field properties except onChange and value', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      const { field } = result.current;
      expect(field.name).toBe(mockField.name);
      expect(field.onBlur).toBe(mockField.onBlur);
      expect(field.ref).toBe(mockField.ref);
      expect(field.disabled).toBe(mockField.disabled);

      // These should be different (enhanced)
      expect(field.onChange).not.toBe(mockField.onChange);
      expect(field.value).not.toBe(mockField.value);
    });
  });

  describe('value conversion', () => {
    it('should convert field value using fromNullishString', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      expect(fromNullishString).toHaveBeenCalledWith('mock-value');
      expect(result.current.field.value).toBe('fromNullish(mock-value)');
    });

    it('should handle different field values', () => {
      const mockFieldWithNull = { ...mockField, value: null };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useRHFController as any).mockReturnValueOnce({
        field: mockFieldWithNull,
        formState: mockFormState,
        fieldState: mockFieldState,
      });

      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      expect(fromNullishString).toHaveBeenCalledWith(null);
      expect(result.current.field.value).toBe('fromNullish(null)');
    });
  });

  describe('onChange behavior', () => {
    it('should wrap onChange to use toNullishString', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      result.current.field.onChange('test-value');

      expect(toNullishString).toHaveBeenCalledWith('test-value');
      expect(mockField.onChange).toHaveBeenCalledWith('toNullish(test-value)');
    });

    it('should handle React synthetic events', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      const mockEvent = {
        target: { value: 'event-value' },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.field.onChange(mockEvent);

      expect(toNullishString).toHaveBeenCalledWith('event-value');
      expect(mockField.onChange).toHaveBeenCalledWith('toNullish(event-value)');
    });

    it('should handle direct value changes', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      result.current.field.onChange('direct-value');

      expect(toNullishString).toHaveBeenCalledWith('direct-value');
      expect(mockField.onChange).toHaveBeenCalledWith(
        'toNullish(direct-value)',
      );
    });

    it('should handle events without target property', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      const mockEventWithoutTarget = { value: 'no-target' };

      result.current.field.onChange(mockEventWithoutTarget);

      expect(toNullishString).toHaveBeenCalledWith(mockEventWithoutTarget);
      expect(mockField.onChange).toHaveBeenCalledWith(
        'toNullish([object Object])',
      );
    });

    it('should preserve empty strings without nullish conversion', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      // Test direct empty string
      result.current.field.onChange('');

      expect(toNullishString).not.toHaveBeenCalledWith('');
      expect(mockField.onChange).toHaveBeenCalledWith('');

      // Test empty string from event
      const mockEventWithEmptyValue = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.field.onChange(mockEventWithEmptyValue);

      expect(toNullishString).not.toHaveBeenCalledWith('');
      expect(mockField.onChange).toHaveBeenCalledWith('');
    });

    it('should handle multiple arguments (spread)', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      const mockEvent = { target: { value: 'spread-value' } };

      result.current.field.onChange(mockEvent, 'extra-arg');

      expect(toNullishString).toHaveBeenCalledWith('spread-value');
      expect(mockField.onChange).toHaveBeenCalledWith(
        'toNullish(spread-value)',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work with validation rules', () => {
      const props = {
        name: 'email' as const,
        rules: {
          required: 'Email is required',
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'Invalid email',
          },
        },
      };

      renderHook(() => useController<TestFormValues>(props));

      expect(useRHFController).toHaveBeenCalledWith(props);
    });

    it('should handle disabled state', () => {
      const mockDisabledField = { ...mockField, disabled: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useRHFController as any).mockReturnValueOnce({
        field: mockDisabledField,
        formState: mockFormState,
        fieldState: mockFieldState,
      });

      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field', disabled: true }),
      );

      expect(result.current.field.disabled).toBe(true);
    });

    it('should handle field state errors', () => {
      const mockErrorFieldState = {
        ...mockFieldState,
        invalid: true,
        error: { message: 'Field is required', type: 'required' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useRHFController as any).mockReturnValueOnce({
        field: mockField,
        formState: mockFormState,
        fieldState: mockErrorFieldState,
      });

      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      expect(result.current.fieldState.invalid).toBe(true);
      expect(result.current.fieldState.error).toEqual({
        message: 'Field is required',
        type: 'required',
      });
    });
  });

  describe('type safety', () => {
    it('should provide enhanced field type with string value', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      // Value should be the converted string
      const { value } = result.current.field;
      expect(typeof value).toBe('string');
      expect(value).toBe('fromNullish(mock-value)');
    });

    it('should provide onChange that accepts various types', () => {
      const { result } = renderHook(() =>
        useController<TestFormValues>({ name: 'test-field' }),
      );

      const { onChange } = result.current.field;
      expect(typeof onChange).toBe('function');

      // Should not throw TypeScript errors when called with different types
      onChange('string');
      onChange(123);
      onChange(null);
      onChange({ target: { value: 'event' } });
    });
  });
});
