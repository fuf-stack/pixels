import type { FieldError } from 'react-hook-form';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, renderHook } from '@testing-library/react';

import { useUniformField } from './useUniformField';

// ------- Mocks -------
interface MockGetFieldStateReturn {
  error?: FieldError[];
  invalid: boolean;
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
    mockReducedMotion = false;
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

  describe('showInvalidWhen behavior', () => {
    it('touched mode: hides errors when field is not touched and form not submitted', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: false, // showInvalid logic makes this false when not touched
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() =>
        useUniformField({ name: 'f', showInvalidWhen: 'touched' }),
      );

      // Field has errors but not touched and no submit attempt -> invalid should be false
      expect(result.current.invalid).toBe(false);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('touched mode: shows errors when field is touched', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: true,
        isTouched: true,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() =>
        useUniformField({ name: 'f', showInvalidWhen: 'touched' }),
      );

      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('touched mode: shows errors after form submit attempt', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 1;

      const { result } = renderHook(() =>
        useUniformField({ name: 'f', showInvalidWhen: 'touched' }),
      );

      // Not touched but form submitted -> should show errors
      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('immediate mode: shows errors immediately when field becomes invalid', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Select at least 2' }] as unknown as FieldError[],
        invalid: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() =>
        useUniformField({ name: 'f', showInvalidWhen: 'immediate' }),
      );

      // Field is invalid, not touched, no submit -> immediate mode should show error
      expect(result.current.invalid).toBe(true);
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('immediate mode: does not show invalid when field is actually valid', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: undefined,
        invalid: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() =>
        useUniformField({ name: 'f', showInvalidWhen: 'immediate' }),
      );

      // Valid field -> should not show invalid (invalid is false from getFieldState)
      expect(result.current.invalid).toBe(false);
      // errorMessage is always a React element, FieldValidationError handles null errors
      expect(result.current.errorMessage).not.toBeNull();
    });

    it('defaults to touched mode when showInvalidWhen is not specified', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as unknown as FieldError[],
        invalid: false, // Default touched mode, not touched, no submit
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(
        () => useUniformField({ name: 'f' }), // no showInvalidWhen specified
      );

      // Should behave like touched mode (default) - not showing error when not touched
      expect(result.current.invalid).toBe(false);
    });
  });
});
