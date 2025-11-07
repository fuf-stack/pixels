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
    it('should start with animations disabled when initialization is needed', () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      expect(result.current.disableAnimation).toBe(true);
    });

    it('should enable animations after initialization when motion is not reduced', async () => {
      const { result } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
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
          lastElementNotRemovable: true,
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
          lastElementNotRemovable: true,
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

      expect(mockSetValue).toHaveBeenCalledWith('testArray', [{}], {
        shouldDirty: false,
        shouldTouch: false,
      });
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

      expect(mockSetValue).toHaveBeenCalledWith(
        'testArray',
        [{ customField: 'value' }],
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
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

  describe('Validation triggering (disabled - tests kept for future reference)', () => {
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
      mockFields = [];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Wait for initialization to complete
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Now that initialization is complete, add another element
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

  describe('Reset behavior', () => {
    it('should re-initialize when form is reset and lastElementNotRemovable is true', async () => {
      mockFields = [];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Initial setValue call for initialization
      expect(mockSetValue).toHaveBeenCalledTimes(1);

      // Wait for initial initialization
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Simulate that fields now has 1 element (setValue would have added it)
      mockFields = [{ id: '1' }];
      rerender();

      // Clear setValue calls
      mockSetValue.mockClear();

      // Simulate form reset by clearing fields
      mockFields = [];
      rerender();

      // Should trigger re-initialization - setValue should be called
      expect(mockSetValue).toHaveBeenCalledTimes(1);

      // Wait for re-initialization to complete
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });
    });

    it('should detect needsInitialize correctly on reset via fields.length change', async () => {
      // Start with empty fields
      mockFields = [];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Initial initialization should happen (needsInitialize = true)
      expect(mockSetValue).toHaveBeenCalledWith('testArray', [{}], {
        shouldDirty: false,
        shouldTouch: false,
      });

      // Wait for initialization
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Simulate field added (needsInitialize = false now)
      mockFields = [{ id: '1' }];
      mockSetValue.mockClear();
      rerender();

      // Add more fields - no initialization should happen
      mockFields = [{ id: '1' }, { id: '2' }];
      rerender();
      expect(mockSetValue).not.toHaveBeenCalled();

      // Simulate reset - fields become empty again
      mockFields = [];
      rerender();

      // needsInitialize should become true again, triggering re-initialization
      expect(mockSetValue).toHaveBeenCalledWith('testArray', [{}], {
        shouldDirty: false,
        shouldTouch: false,
      });
    });

    it('should correctly toggle needsInitialize based on fields.length and lastElementNotRemovable', async () => {
      // Test 1: Start with fields.length = 0, lastElementNotRemovable = true -> needsInitialize = true
      mockFields = [];
      const { rerender } = renderHook(
        ({ lastElementNotRemovable }) =>
          useUniformFieldArray({
            name: 'testArray',
            lastElementNotRemovable,
          }),
        {
          initialProps: { lastElementNotRemovable: true },
        },
      );

      expect(mockSetValue).toHaveBeenCalledTimes(1); // Should initialize
      mockSetValue.mockClear();

      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Test 2: fields.length = 1 -> needsInitialize = false
      mockFields = [{ id: '1' }];
      rerender({ lastElementNotRemovable: true });
      expect(mockSetValue).not.toHaveBeenCalled(); // Should not initialize

      // Test 3: fields.length = 0 again -> needsInitialize = true
      mockFields = [];
      rerender({ lastElementNotRemovable: true });
      expect(mockSetValue).toHaveBeenCalledTimes(1); // Should re-initialize
      mockSetValue.mockClear();

      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Test 4: Change lastElementNotRemovable to false while fields.length = 0 -> needsInitialize = false
      mockFields = [];
      rerender({ lastElementNotRemovable: false });
      expect(mockSetValue).not.toHaveBeenCalled(); // Should not initialize
    });

    it('should keep animations enabled during re-initialization', async () => {
      mockFields = [];

      const { result, rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Wait for initial initialization
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Animations should be enabled after init
      expect(result.current.disableAnimation).toBe(false);

      // Simulate that fields now has 1 element
      mockFields = [{ id: '1' }];
      rerender();

      // Simulate form reset
      mockFields = [];

      await act(async () => {
        rerender();
      });

      // Animations should remain enabled during re-init (reset scenario)
      // The parent component is responsible for managing animations during reset
      expect(result.current.disableAnimation).toBe(false);

      // Wait for re-initialization to complete
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Animations should still be enabled after re-initialization
      expect(result.current.disableAnimation).toBe(false);
    });

    it('should skip validation during re-initialization', async () => {
      mockFields = [];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: true,
        }),
      );

      // Wait for initial initialization
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Simulate that fields now has 1 element
      mockFields = [{ id: '1' }];
      rerender();

      // Wait for validation to trigger
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Clear all previous calls
      mockTrigger.mockClear();

      // Simulate form reset
      mockFields = [];
      rerender();

      // Trigger validation delay but should not call trigger during re-init
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      // Complete re-initialization
      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Simulate field was re-added by initialization
      mockFields = [{ id: '1' }];
      rerender();

      // Now add another field to trigger validation
      mockFields = [{ id: '1' }, { id: '2' }];
      rerender();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // Should trigger validation after re-init is complete
      expect(mockTrigger).toHaveBeenCalledWith('testArray');
    });

    it('should not re-initialize when lastElementNotRemovable is false', async () => {
      mockFields = [{ id: '1' }];

      const { rerender } = renderHook(() =>
        useUniformFieldArray({
          name: 'testArray',
          lastElementNotRemovable: false,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Clear setValue calls from any initialization
      mockSetValue.mockClear();

      // Simulate clearing fields
      mockFields = [];
      rerender();

      await act(async () => {
        vi.advanceTimersByTime(2);
        await Promise.resolve();
      });

      // Should NOT call setValue (no re-initialization)
      expect(mockSetValue).not.toHaveBeenCalled();
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
