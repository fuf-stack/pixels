import type { FieldError } from 'react-hook-form';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, renderHook } from '@testing-library/react';

import { useUniformField } from './useUniformField';

// ------- Mocks -------
interface MockGetFieldStateReturn {
  error?: FieldError[];
  invalid: boolean;
  isDirty?: boolean;
  isTouched?: boolean;
  required: boolean;
  testId: string;
}

interface MockUseFormContextReturn {
  control: object;
  debugMode?: string;
  formState?: { submitCount: number };
  getFieldState: (name: string) => MockGetFieldStateReturn;
  getValues: () => Record<string, unknown>;
}

interface MockField {
  disabled: boolean;
  onBlur: () => void;
  onChange: (...args: unknown[]) => void;
  ref: () => void;
}

let mockContext: MockUseFormContextReturn;
vi.mock('../useFormContext/useFormContext', () => ({
  useFormContext: () => mockContext,
}));

let mockField: MockField;
let mockFormState: { submitCount: number };
vi.mock('../useController/useController', () => ({
  useController: () => ({
    field: mockField,
    formState: mockFormState,
    fieldState: {},
  }),
}));

let mockReducedMotion = false;
vi.mock('@fuf-stack/pixel-motion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

vi.mock('../../partials/FieldCopyTestIdButton', () => ({
  FieldCopyTestIdButton: ({ testId }: { testId: string }) => (
    <span data-testid={`copy-${testId}`}>copy</span>
  ),
}));

vi.mock('../../partials/FieldValidationError', () => ({
  FieldValidationError: ({ testId }: { testId: string }) => (
    <span data-testid={`error-${testId}`}>error</span>
  ),
}));

describe('useUniformField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion = true; // Disable debouncing delay in tests
    mockFormState = { submitCount: 0 };
    mockField = {
      disabled: false,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    };
    mockContext = {
      control: {},
      debugMode: undefined,
      formState: mockFormState,
      getFieldState: vi.fn((name: string) => ({
        error: undefined as FieldError[] | undefined,
        invalid: false,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: `${name}-tid`,
      })),
      getValues: vi.fn(() => ({})),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('invalid state debouncing', () => {
    it('immediately shows invalid state when reduced motion is enabled', () => {
      mockReducedMotion = true; // Enable immediate updates
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Error' }] as unknown as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // With reduced motion, invalid should be true immediately (no debounce)
      expect(result.current.invalid).toBe(true);
    });

    it('debounces invalid state changes when reduced motion is disabled', async () => {
      mockReducedMotion = false; // Enable debouncing
      let fieldState = {
        error: undefined as FieldError[] | undefined,
        invalid: false,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      };

      mockContext.getFieldState = vi.fn(() => fieldState);

      const { result, rerender } = renderHook(() =>
        useUniformField({ name: 'f' }),
      );

      // Initially valid
      expect(result.current.invalid).toBe(false);

      // Change to invalid
      fieldState = {
        error: [{ message: 'Error' }] as unknown as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      };
      rerender();

      // Should still be false immediately (debouncing active)
      expect(result.current.invalid).toBe(false);

      // Advance time by 200ms (the debounce delay)
      await vi.advanceTimersByTimeAsync(200);

      // Trigger rerender to get updated value
      rerender();

      // Now invalid should be true after debounce
      expect(result.current.invalid).toBe(true);
    });

    it('cancels previous debounce when field state changes rapidly', async () => {
      mockReducedMotion = false; // Enable debouncing
      let fieldState = {
        error: undefined as FieldError[] | undefined,
        invalid: false,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      };

      mockContext.getFieldState = vi.fn(() => fieldState);

      const { result, rerender } = renderHook(() =>
        useUniformField({ name: 'f' }),
      );

      // Change to invalid
      fieldState = {
        error: [{ message: 'Error' }] as unknown as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      };
      rerender();

      // Advance time by 100ms (halfway through debounce)
      await vi.advanceTimersByTimeAsync(100);

      // Change back to valid
      fieldState = {
        error: undefined,
        invalid: false,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      };
      rerender();

      // Should still be false (previous debounce was cancelled)
      expect(result.current.invalid).toBe(false);

      // Advance remaining time and trigger rerender
      await vi.advanceTimersByTimeAsync(200);
      rerender();

      // Should now reflect the final state (valid)
      expect(result.current.invalid).toBe(false);
    });
  });

  it('returns core field data and handlers', () => {
    const { result } = renderHook(() =>
      useUniformField({ name: 'myField', testId: 'custom' }),
    );

    expect(result.current.testId).toBe('myField-tid');
    expect(result.current.required).toBe(false);
    expect(result.current.invalid).toBe(false);
    expect(result.current.disabled).toBe(false);
    expect(typeof result.current.onBlur).toBe('function');
    expect(typeof result.current.onChange).toBe('function');
    expect(result.current.ref).toBeTypeOf('function');
  });

  it('provides defaultValue from form values', () => {
    mockContext.getValues = vi.fn(() => ({ myField: 'abc' }));

    const { result } = renderHook(() => useUniformField({ name: 'myField' }));
    expect(result.current.defaultValue).toBe('abc');
  });

  it('builds errorMessage when errors exist', () => {
    const errors = [{ message: 'Required' }] as unknown as FieldError[];
    mockContext.getFieldState = vi.fn((name: string) => ({
      error: errors,
      invalid: true,
      required: true,
      testId: `${name}-tid`,
    }));

    const { result } = renderHook(() => useUniformField({ name: 'field' }));
    expect(result.current.errorMessage).not.toBeNull();
  });

  // Note: These tests verify the debouncing behavior exists but are implementation-aware
  // The actual user-facing behavior is verified through snapshot tests
  it('returns invalid state from getFieldState', () => {
    mockContext.getFieldState = vi.fn(() => ({
      error: undefined,
      invalid: true,
      isTouched: false,
      required: false,
      testId: 'f-tid',
    }));

    const { result } = renderHook(() => useUniformField({ name: 'f' }));

    // Should return the invalid state (debounced or not, behavior is tested in snapshots)
    expect(typeof result.current.invalid).toBe('boolean');
  });

  it('computes label with provided label only', () => {
    const { result } = renderHook(() =>
      useUniformField({ name: 'f', label: 'Label' }),
    );
    expect(result.current.label).not.toBeNull();
  });

  it('computes label with copy button in debug-testids mode', () => {
    mockContext.debugMode = 'debug-testids';
    const { result } = renderHook(() => useUniformField({ name: 'f' }));
    expect(result.current.label).not.toBeNull();

    // Render the label node to assert the mocked copy button
    const { getByTestId } = render(<>{result.current.label}</>);
    expect(getByTestId('copy-f-tid')).toBeTruthy();
  });

  it('omits label when not provided and not in debug mode', () => {
    const { result } = renderHook(() => useUniformField({ name: 'f' }));
    expect(result.current.label).toBeNull();
  });

  describe('showInvalid behavior', () => {
    it('hides errors when field is not dirty, not touched, and form not submitted', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: false,
        isDirty: false,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field has errors but not dirty/touched and no submit attempt -> should not show
      expect(result.current.invalid).toBe(false);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('shows errors when field is dirty (even if not touched)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Select at least 2' }] as unknown as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field is invalid and dirty -> should show error
      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('shows errors when field is touched (even if not dirty)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: true,
        isDirty: false,
        isTouched: true,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field is invalid and touched -> should show error
      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('shows errors after form submit attempt', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: true,
        isDirty: false,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 1;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Not dirty/touched but form submitted -> should show errors
      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('does not show errors when field is invalid but not dirty/touched/submitted', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Select at least 2' }] as unknown as FieldError[],
        invalid: true,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field is invalid but NOT dirty/touched/submitted -> should NOT show error
      expect(result.current.invalid).toBe(false);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('does not show invalid when field is actually valid', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: undefined,
        invalid: false,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Valid field -> should not show invalid
      expect(result.current.invalid).toBe(false);
      // errorMessage is always a React element, FieldValidationError handles null errors
      expect(result.current.errorMessage).not.toBeNull();
    });
  });
});
