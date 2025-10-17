import type { FieldError } from 'react-hook-form';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, render, renderHook } from '@testing-library/react';

import { useUniformField } from './useUniformField';

// ------- Mocks -------
interface MockGetFieldStateReturn {
  error?: FieldError[];
  invalid: boolean;
  required: boolean;
  testId: string;
}

interface MockUseFormContextReturn {
  control: object;
  debugMode?: string;
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
vi.mock('../useController/useController', () => ({
  useController: () => ({ field: mockField, formState: {}, fieldState: {} }),
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
    mockField = {
      disabled: false,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    };
    mockContext = {
      control: {},
      debugMode: undefined,
      getFieldState: vi.fn((name: string) => ({
        error: undefined as FieldError[] | undefined,
        invalid: false,
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

  it('debounces invalid=false for exit animations', () => {
    let rawInvalid = true;
    mockContext.getFieldState = vi.fn(() => ({
      error: undefined,
      invalid: rawInvalid,
      required: false,
      testId: 'f-tid',
    }));

    const { result, rerender } = renderHook(() =>
      useUniformField({ name: 'f' }),
    );

    // initially true
    expect(result.current.invalid).toBe(true);

    // flip to false -> should remain true until timer elapses
    rawInvalid = false;
    rerender();
    expect(result.current.invalid).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.invalid).toBe(false);
  });

  it('applies invalid changes immediately when reduced motion is preferred', () => {
    let rawInvalid = false;
    mockReducedMotion = true;
    mockContext.getFieldState = vi.fn(() => ({
      error: undefined,
      invalid: rawInvalid,
      required: false,
      testId: 'f-tid',
    }));

    const { result, rerender } = renderHook(() =>
      useUniformField({ name: 'f' }),
    );
    expect(result.current.invalid).toBe(false);

    // change to true should reflect immediately (no debounce)
    rawInvalid = true;
    rerender();
    expect(result.current.invalid).toBe(true);

    // change back to false should also reflect immediately with reduced motion
    rawInvalid = false;
    rerender();
    expect(result.current.invalid).toBe(false);
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
});
