import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useUniformFieldArray } from './useUniformFieldArray';

// Mock dependencies
const mockTrigger = vi.fn();
const mockSetValue = vi.fn();
const mockAppend = vi.fn();
const mockRemove = vi.fn();
const mockInsert = vi.fn();
const mockMove = vi.fn();

let mockPrefersReducedMotion = false;
let mockFields: unknown[] = [];

vi.mock('react-hook-form', () => ({
  useFieldArray: vi.fn(() => ({
    fields: mockFields,
    append: mockAppend,
    remove: mockRemove,
    insert: mockInsert,
    move: mockMove,
  })),
}));

vi.mock('../useFormContext/useFormContext', () => ({
  useFormContext: vi.fn(() => ({
    trigger: mockTrigger,
    setValue: mockSetValue,
  })),
}));

vi.mock('../useUniformField/useUniformField', () => ({
  useUniformField: vi.fn((params) => ({
    control: { _formControl: true },
    error: undefined,
    getValues: vi.fn(),
    invalid: false,
    testId: params.testId ?? 'test-field',
    field: {},
    disabled: params.disabled,
    label: params.label,
  })),
}));

vi.mock('@fuf-stack/pixel-motion', () => ({
  useReducedMotion: vi.fn(() => mockPrefersReducedMotion),
}));

describe('useUniformFieldArray', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockPrefersReducedMotion = false;
    mockFields = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should return all required field array methods and state', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(result.current).toHaveProperty('fields');
      expect(result.current).toHaveProperty('append');
      expect(result.current).toHaveProperty('remove');
      expect(result.current).toHaveProperty('insert');
      expect(result.current).toHaveProperty('move');
      expect(result.current).toHaveProperty('disableAnimation');
      expect(result.current).toHaveProperty('elementInitialValue');
    });

    it('should return uniform field state', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(result.current).toHaveProperty('control');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('getValues');
      expect(result.current).toHaveProperty('invalid');
      expect(result.current).toHaveProperty('testId');
    });
  });

  describe('Animation control', () => {
    it('should start with animations disabled', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(result.current.disableAnimation).toBe(true);
    });

    it('should enable animations after initialization when motion is not reduced', async () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(result.current.disableAnimation).toBe(true);

      // Fast-forward past initialization delay (1ms) and let React update
      await act(async () => {
        vi.advanceTimersByTime(2);
        // Allow microtasks to flush
        await Promise.resolve();
      });

      expect(result.current.disableAnimation).toBe(false);
    });

    it('should keep animations disabled when user prefers reduced motion', async () => {
      mockPrefersReducedMotion = true;

      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(result.current.disableAnimation).toBe(true);

      // Fast-forward past initialization delay
      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Should still be disabled
      expect(result.current.disableAnimation).toBe(true);
    });

    it('should update animation state when motion preference changes after initialization', async () => {
      const { result, rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      // Wait for initialization and animation to be enabled
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      expect(result.current.disableAnimation).toBe(false);

      // Change motion preference
      mockPrefersReducedMotion = true;

      await act(async () => {
        rerender();
      });

      expect(result.current.disableAnimation).toBe(true);
    });
  });

  describe('Initialization with lastElementNotRemovable', () => {
    it('should add initial element when lastElementNotRemovable is true and array is empty', () => {
      mockFields = [];

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      expect(mockSetValue).toHaveBeenCalledWith('testArray', [{}]);
    });

    it('should not add element when array already has items', () => {
      mockFields = [{ id: '1', value: 'existing' }];

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      expect(mockSetValue).not.toHaveBeenCalled();
    });

    it('should not add element when lastElementNotRemovable is false', () => {
      mockFields = [];

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: false,
        }),
      );

      expect(mockSetValue).not.toHaveBeenCalled();
    });

    it('should use custom elementInitialValue when provided', () => {
      mockFields = [];

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
          elementInitialValue: { customField: 'value' },
        }),
      );

      expect(mockSetValue).toHaveBeenCalledWith('testArray', [
        { customField: 'value' },
      ]);
    });
  });

  describe('Flat array support', () => {
    it('should prepare elementInitialValue with flatArrayKey for flat arrays', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          flat: true,
          elementInitialValue: 'test value',
        }),
      );

      expect(result.current.elementInitialValue).toEqual({
        __FLAT__: 'test value',
      });
    });

    it('should prepare elementInitialValue without flatArrayKey for object arrays', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          flat: false,
          elementInitialValue: { name: 'test' },
        }),
      );

      expect(result.current.elementInitialValue).toEqual({ name: 'test' });
    });

    it('should use null as default for flat arrays', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          flat: true,
        }),
      );

      expect(result.current.elementInitialValue).toEqual({
        __FLAT__: null,
      });
    });

    it('should use empty object as default for object arrays', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          flat: false,
        }),
      );

      expect(result.current.elementInitialValue).toEqual({});
    });
  });

  describe('Validation triggering', () => {
    it('should not trigger validation during initialization', async () => {
      mockFields = [];

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Even though setValue is called, validation shouldn't trigger yet
      expect(mockTrigger).not.toHaveBeenCalled();

      // Fast-forward past validation delay
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Still shouldn't have triggered during init
      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should trigger validation when fields length changes after initialization', async () => {
      mockFields = [{ id: '1' }];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      // Wait for initialization to complete
      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      // Change fields length
      mockFields = [{ id: '1' }, { id: '2' }];
      rerender();

      // Fast-forward past validation delay (200ms)
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(mockTrigger).toHaveBeenCalledWith('testArray');
    });

    it('should use 200ms delay for validation trigger', async () => {
      mockFields = [{ id: '1' }];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      // Wait for initialization
      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      mockFields = [{ id: '1' }, { id: '2' }];
      rerender();

      // Shouldn't trigger before delay
      await act(async () => {
        vi.advanceTimersByTime(199);
      });
      expect(mockTrigger).not.toHaveBeenCalled();

      // Should trigger after delay
      await act(async () => {
        vi.advanceTimersByTime(1);
      });
      expect(mockTrigger).toHaveBeenCalledWith('testArray');
    });
  });

  describe('Integration with useUniformField', () => {
    it('should pass through label prop', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          label: 'Test Label',
        }),
      );

      expect(result.current.label).toBe('Test Label');
    });

    it('should pass through disabled prop', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          disabled: true,
        }),
      );

      expect(result.current.disabled).toBe(true);
    });

    it('should pass through testId prop', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          testId: 'custom-test-id',
        }),
      );

      expect(result.current.testId).toBe('custom-test-id');
    });

    it('should default showInvalidWhen to immediate', async () => {
      const { useUniformField } = await import(
        '../useUniformField/useUniformField'
      );
      const useUniformFieldMock = vi.mocked(useUniformField);

      renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
        }),
      );

      expect(useUniformFieldMock).toHaveBeenCalledWith(
        expect.objectContaining({
          showInvalidWhen: 'immediate',
        }),
      );
    });
  });

  describe('elementInitialValue memoization', () => {
    it('should memoize elementInitialValue to avoid unnecessary recalculations', () => {
      const { result, rerender } = renderHook(
        ({ initialValue }) =>
          useUniformFieldArray({
            name: 'testArray',
            flat: true,
            elementInitialValue: initialValue,
          }),
        {
          initialProps: { initialValue: 'test' },
        },
      );

      const firstValue = result.current.elementInitialValue;

      // Rerender with same props
      rerender({ initialValue: 'test' });

      // Should be the same reference (memoized)
      expect(result.current.elementInitialValue).toBe(firstValue);
    });

    it('should update elementInitialValue when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ initialValue }) =>
          useUniformFieldArray({
            name: 'testArray',
            flat: true,
            elementInitialValue: initialValue,
          }),
        {
          initialProps: { initialValue: 'test1' },
        },
      );

      const firstValue = result.current.elementInitialValue;

      // Change the initial value
      rerender({ initialValue: 'test2' });

      // Should be a different object
      expect(result.current.elementInitialValue).not.toBe(firstValue);
      expect(result.current.elementInitialValue).toEqual({
        __FLAT__: 'test2',
      });
    });
  });
});
