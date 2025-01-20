import { describe, expect, test } from 'vitest';

import { useInput } from '@heroui/input';
import { act, renderHook } from '@testing-library/react';

describe('useInput hook', () => {
  describe('basic functionality', () => {
    test('should initialize with default values', () => {
      const { result } = renderHook(() => useInput({}));

      expect(result.current.getInputProps().value).toBe('');
      expect(result.current.isInvalid).toBe(false);
    });

    test('should update value when changed', () => {
      const { result } = renderHook(() => useInput({}));

      act(() => {
        const event = { target: { value: 'test value' } };
        result.current.getInputProps().onChange(event);
      });

      expect(result.current.getInputProps().value).toBe('test value');
    });

    test('should handle controlled value', () => {
      const { result } = renderHook(() =>
        useInput({
          value: 'controlled',
        }),
      );

      expect(result.current.getInputProps().value).toBe('controlled');
    });
  });

  describe('validation states', () => {
    test('should show invalid state when validationState is invalid', () => {
      const { result } = renderHook(() =>
        useInput({
          validationState: 'invalid',
        }),
      );

      expect(result.current.isInvalid).toBe(true);
    });

    test('should handle error message', () => {
      const errorMessage = 'This field is required';
      const { result } = renderHook(() =>
        useInput({
          errorMessage,
          validationState: 'invalid',
        }),
      );

      expect(result.current.errorMessage).toBe(errorMessage);
    });
  });

  describe('label handling', () => {
    test('should handle label placement', () => {
      const { result } = renderHook(() =>
        useInput({
          label: 'Test Label',
          labelPlacement: 'outside',
        }),
      );

      expect(result.current.label).toBe('Test Label');
      expect(result.current.labelPlacement).toBe('outside');
    });

    test('should default to outside placement when no label provided', () => {
      const { result } = renderHook(() => useInput({}));

      expect(result.current.labelPlacement).toBe('outside');
    });
  });

  describe('disabled state', () => {
    test('should handle disabled state', () => {
      const { result } = renderHook(() =>
        useInput({
          isDisabled: true,
        }),
      );

      const inputProps = result.current.getInputProps();
      expect(inputProps.disabled).toBe(true);
    });
  });

  describe('content rendering', () => {
    test('should handle start and end content', () => {
      const startContent = <div>Start</div>;
      const endContent = <div>End</div>;

      const { result } = renderHook(() =>
        useInput({
          startContent,
          endContent,
        }),
      );

      expect(result.current.startContent).toBe(startContent);
      expect(result.current.endContent).toBe(endContent);
    });
  });
});
