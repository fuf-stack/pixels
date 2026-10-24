import type { FieldError } from 'react-hook-form';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, renderHook, screen } from '@testing-library/react';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldValidationError from '../../partials/FieldValidationError';
import useUniformField from './useUniformField';

// ------- Mocks -------
interface MockGetFieldStateReturn {
  error?: unknown;
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
  getFieldState: (name: string, testId?: string) => MockGetFieldStateReturn;
  getValues: () => Record<string, unknown>;
  resetField: () => void;
}

interface MockField {
  disabled: boolean;
  name: string;
  onBlur: () => void;
  onChange: (...args: unknown[]) => void;
  ref: () => void;
  value?: unknown;
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

vi.mock('../../partials/FieldCopyTestIdButton', () => {
  const MockFieldCopyTestIdButton = ({ testId }: { testId: string }) => (
    <span data-testid={`copy-${testId}`}>copy</span>
  );

  return {
    default: MockFieldCopyTestIdButton,
    FieldCopyTestIdButton: MockFieldCopyTestIdButton,
  };
});

describe('useUniformField', () => {
  describe('owned control associations', () => {
    it('keeps IDs stable through rerenders and distinct for repeated field names', () => {
      const { result, rerender } = renderHook(() => [
        useUniformField({ name: 'field', label: 'First' }),
        useUniformField({ name: 'field', label: 'Second' }),
      ]);
      const firstIds = result.current[0].field.ids;
      expect(firstIds.control).not.toBe(result.current[1].field.ids.control);
      rerender();
      expect(result.current[0].field.ids).toEqual(firstIds);
    });

    it('associates labels and help with the editable control without native validation', () => {
      mockContext.getFieldState = vi.fn(() => ({
        required: true,
        invalid: false,
        testId: 'field',
      }));
      const { result } = renderHook(() =>
        useUniformField({
          name: 'field',
          label: 'Editor',
          description: 'Markdown supported',
        }),
      );
      const { ids } = result.current.field;
      const controlProps = getFieldControlProps(result.current.field);
      const controlId = ids.control;
      render(
        <>
          <label htmlFor={controlId} id={ids.label}>
            Editor
            <textarea {...controlProps} />
          </label>
          <div id={ids.description}>Markdown supported</div>
        </>,
      );
      const editor = screen.getByRole('textbox', { name: 'Editor' });
      expect(editor).toHaveAccessibleDescription('Markdown supported');
      expect(editor.getAttribute('aria-required')).toBe('true');
      expect(editor).not.toHaveAttribute('required');
      expect(editor).not.toHaveAttribute('aria-invalid');
    });

    it('associates visible errors according to existing touched/validation timing', () => {
      const state = {
        required: true,
        invalid: true,
        isTouched: false,
        testId: 'field',
        error: [{ message: 'Required', type: 'required' }] as FieldError[],
      };
      mockContext.getFieldState = vi.fn(() => state);
      const { result, rerender } = renderHook(() =>
        useUniformField({
          name: 'field',
          description: 'Help',
        }),
      );
      expect(
        getFieldControlProps(result.current.field)['aria-describedby'],
      ).toBe(result.current.field.ids.description);
      state.isTouched = true;
      rerender();
      expect(
        getFieldControlProps(result.current.field)['aria-describedby'],
      ).toBe(
        `${result.current.field.ids.description} ${result.current.field.ids.error}`,
      );
      expect(getFieldControlProps(result.current.field)['aria-invalid']).toBe(
        true,
      );
    });

    it('keeps explicit aria-label precedence and the field-name fallback', () => {
      const { result } = renderHook(() => [
        useUniformField({
          name: 'field',
          label: 'Visible',
          ariaLabel: 'Custom',
        }),
        useUniformField({ name: 'field' }),
      ]);
      expect(getFieldControlProps(result.current[0].field)).toMatchObject({
        'aria-label': 'Custom',
        'aria-labelledby': undefined,
      });
      expect(getFieldControlProps(result.current[1].field)).toMatchObject({
        'aria-label': 'field',
        'aria-labelledby': undefined,
      });
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
    mockFormState = { submitCount: 0 };
    mockField = {
      name: 'myField',
      disabled: false,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
      value: undefined, // Default to undefined (empty)
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
      resetField: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('invalid state debouncing', () => {
    it('updates immediately in test environment (NODE_ENV=test)', () => {
      let fieldState = {
        error: undefined as FieldError[] | undefined,
        invalid: false,
        isTouched: true, // Field is touched to trigger showInvalid
        required: false,
        testId: 'f-tid',
      };

      mockContext.getFieldState = vi.fn(() => fieldState);

      const { result, rerender } = renderHook(() =>
        useUniformField({ name: 'f' }),
      );

      // Initially valid
      expect(result.current.field.invalid).toBe(false);

      // Change to invalid
      fieldState = {
        error: [{ message: 'Error' }] as FieldError[],
        invalid: true,
        isTouched: true, // Field is touched
        required: false,
        testId: 'f-tid',
      };
      rerender();

      // In test environment, should update immediately (no debounce)
      expect(result.current.field.invalid).toBe(true);
    });

    describe('production environment', () => {
      afterEach(() => {
        vi.unstubAllEnvs();
      });

      it('debounces invalid state changes in production environment', async () => {
        // Mock production environment
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('VITEST', '');

        let fieldState = {
          error: undefined as FieldError[] | undefined,
          invalid: false,
          isTouched: true, // Field is touched to trigger showInvalid
          required: false,
          testId: 'f-tid',
        };

        mockContext.getFieldState = vi.fn(() => fieldState);

        const { result, rerender } = renderHook(() =>
          useUniformField({ name: 'f' }),
        );

        // Initially valid
        expect(result.current.field.invalid).toBe(false);

        // Change to invalid
        fieldState = {
          error: [{ message: 'Error' }] as FieldError[],
          invalid: true,
          isTouched: true, // Field is touched
          required: false,
          testId: 'f-tid',
        };
        rerender();

        // In production, should still be false immediately (debouncing active)
        expect(result.current.field.invalid).toBe(false);

        // Advance time by 200ms (the debounce delay)
        await vi.advanceTimersByTimeAsync(200);

        // Trigger rerender to get updated value
        rerender();

        // Now invalid should be true after debounce
        expect(result.current.field.invalid).toBe(true);
      });

      it('cancels previous debounce when field state changes rapidly', async () => {
        // Mock production environment
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('VITEST', '');

        let fieldState = {
          error: undefined as FieldError[] | undefined,
          invalid: false,
          isTouched: true, // Field is touched to trigger showInvalid
          required: false,
          testId: 'f-tid',
        };

        mockContext.getFieldState = vi.fn(() => fieldState);

        const { result, rerender } = renderHook(() =>
          useUniformField({ name: 'f' }),
        );

        // Change to invalid
        fieldState = {
          error: [{ message: 'Error' }] as FieldError[],
          invalid: true,
          isTouched: true, // Field is touched
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
          isTouched: true, // Still touched
          required: false,
          testId: 'f-tid',
        };
        rerender();

        // Should still be false (previous debounce was cancelled)
        expect(result.current.field.invalid).toBe(false);

        // Advance remaining time and trigger rerender
        await vi.advanceTimersByTimeAsync(200);
        rerender();

        // Should now reflect the final state (valid)
        expect(result.current.field.invalid).toBe(false);
      });
    });
  });

  it('returns core field data and handlers', () => {
    const { result } = renderHook(() =>
      useUniformField({ name: 'myField', testId: 'custom' }),
    );

    expect(result.current.field.testId).toBe('myField-tid');
    expect(result.current.field.required).toBe(false);
    expect(result.current.field.invalid).toBe(false);
    expect(result.current.field.disabled).toBe(false);
    expect(typeof result.current.field.onBlur).toBe('function');
    expect(typeof result.current.field.onChange).toBe('function');
    expect(result.current.field.ref).toBeTypeOf('function');
  });

  it('keeps form operations outside the explicit field contract', () => {
    Object.assign(mockField, { controllerOnly: true });

    const { result } = renderHook(() => useUniformField({ name: 'myField' }));
    const { field, control, debugMode, getValues, resetField } = result.current;

    expect(field.name).toBe('myField');
    expect(field.onBlur).toBe(mockField.onBlur);
    expect(field.ref).toBe(mockField.ref);
    expect(field).not.toHaveProperty('controllerOnly');
    expect(field).not.toHaveProperty('resetField');
    expect(field).not.toHaveProperty('getValues');
    expect(getFieldControlProps(field)).toHaveProperty('id', field.ids.control);
    expect(result.current).not.toHaveProperty('getControlProps');
    expect(field).not.toHaveProperty('controlProps');
    expect(control).toBe(mockContext.control);
    expect(debugMode).toBe(mockContext.debugMode);
    expect(getValues).toBe(mockContext.getValues);
    expect(resetField).toBe(mockContext.resetField);
  });

  it('provides defaultValue from form values', () => {
    mockContext.getValues = vi.fn(() => ({ myField: 'abc' }));

    const { result } = renderHook(() => useUniformField({ name: 'myField' }));
    expect(result.current.field.defaultValue).toBe('abc');
  });

  it('returns rendered validation messages with normalized error data', () => {
    const errors = [{ message: 'Required' }] as FieldError[];
    mockContext.getFieldState = vi.fn((name: string) => ({
      error: errors,
      invalid: true,
      required: true,
      testId: `${name}-tid`,
    }));

    const { result } = renderHook(() => useUniformField({ name: 'field' }));
    expect(result.current.field.errorMessage).toMatchObject({
      type: FieldValidationError,
      props: { error: errors },
    });
    expect(result.current).not.toHaveProperty('errors');
    render(<>{result.current.field.errorMessage}</>);

    expect(
      screen.getByRole('list', {
        name: 'Validation errors of field field-tid',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('keeps nested object-shaped errors by default', () => {
    const indexedError: FieldError = {
      message: 'Invalid option at index',
      type: 'custom',
    };
    const arrayLevelError: FieldError = {
      message: 'At least one option is required',
      type: 'custom',
    };

    mockContext.getFieldState = vi.fn((name: string) => ({
      error: {
        0: [indexedError],
        _errors: [arrayLevelError],
      },
      invalid: true,
      required: true,
      testId: `${name}-tid`,
    }));

    const { result } = renderHook(() => useUniformField({ name: 'field' }));
    expect(result.current.field.error).toEqual({
      0: [indexedError],
      _errors: [arrayLevelError],
    });
    expect(result.current.field.errorMessage).toMatchObject({
      type: FieldValidationError,
      props: { error: [indexedError, arrayLevelError] },
    });
  });

  it('normalizes nested object-shaped errors when isArrayValue is true', () => {
    const indexedError: FieldError = {
      message: 'Invalid option at index',
      type: 'custom',
    };
    const arrayLevelError: FieldError = {
      message: 'At least one option is required',
      type: 'custom',
    };

    mockContext.getFieldState = vi.fn((name: string) => ({
      error: {
        0: [indexedError],
        _errors: [arrayLevelError],
      },
      invalid: true,
      required: true,
      testId: `${name}-tid`,
    }));

    const { result } = renderHook(() =>
      useUniformField({ isArrayValue: true, name: 'field' }),
    );
    expect(result.current.field.error).toEqual([indexedError, arrayLevelError]);
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
    expect(typeof result.current.field.invalid).toBe('boolean');
  });

  it('computes label with provided label only', () => {
    const { result } = renderHook(() =>
      useUniformField({ name: 'f', label: 'Label' }),
    );
    expect(result.current.field.label).not.toBeNull();
  });

  it('computes label with copy button in debug-testids mode', () => {
    mockContext.debugMode = 'debug-testids';
    const { result } = renderHook(() => useUniformField({ name: 'f' }));
    expect(result.current.field.label).not.toBeNull();

    // Render the label node to assert the mocked copy button
    const { getByTestId } = render(<>{result.current.field.label}</>);
    expect(getByTestId('copy-f-tid')).toBeTruthy();
  });

  it('omits label when not provided and not in debug mode', () => {
    const { result } = renderHook(() => useUniformField({ name: 'f' }));
    expect(result.current.field.label).toBeNull();
  });

  describe('ariaLabel behavior', () => {
    it.each([
      {
        label: 'Visible label',
        ariaLabel: 'Explicit name',
        placeholder: 'Hint',
        expected: 'Explicit name',
      },
      {
        label: 'Visible label',
        placeholder: 'Hint',
        expected: 'Visible label',
      },
      {
        label: <span>Rich label</span>,
        placeholder: 'Hint',
        expected: 'Rich label',
      },
      { placeholder: 'Hint', expected: 'Hint' },
      { label: false, placeholder: 'Hint', expected: 'Hint' },
      { label: '', placeholder: 'Hint', expected: 'Hint' },
      { label: null, placeholder: 'Hint', expected: 'Hint' },
      { placeholder: '  Hint  ', expected: 'Hint' },
      { placeholder: '   ', expected: 'myField' },
      { placeholder: '', expected: 'myField' },
      { expected: 'myField' },
    ])(
      'resolves the accessible name to "$expected" for %j',
      ({ label, ariaLabel, placeholder, expected }) => {
        const { result } = renderHook(() =>
          useUniformField({ name: 'myField', label, ariaLabel, placeholder }),
        );
        const { ids } = result.current.field;
        const controlProps = getFieldControlProps(result.current.field);
        render(
          <>
            {label ? (
              <label htmlFor={ids.control} id={ids.label}>
                {label}
              </label>
            ) : null}
            <input {...controlProps} />
          </>,
        );

        expect(screen.getByRole('textbox')).toHaveAccessibleName(expected);
        expect(
          screen.getByRole('textbox').getAttribute('aria-label')?.trim() ??
            null,
        ).toBe(label && !ariaLabel ? null : expected);
      },
    );

    it('uses custom ariaLabel when provided', () => {
      const { result } = renderHook(() =>
        useUniformField({ name: 'myField', ariaLabel: 'Custom Label' }),
      );
      expect(result.current.field.ariaLabel).toBe('Custom Label');
    });

    it('falls back to field name when no label exists', () => {
      const { result } = renderHook(() => useUniformField({ name: 'myField' }));
      expect(result.current.field.ariaLabel).toBe('myField');
    });

    it('uses label text when label is a string', () => {
      const { result } = renderHook(() =>
        useUniformField({ name: 'myField', label: 'Visible Label' }),
      );
      expect(result.current.field.ariaLabel).toBe('Visible Label');
    });

    it('falls back to name when label is a React component', () => {
      const { result } = renderHook(() =>
        useUniformField({
          name: 'myField',
          label: <span>Component</span>,
        }),
      );
      expect(result.current.field.ariaLabel).toBe('myField');
    });

    it('prefers custom ariaLabel over label text', () => {
      const { result } = renderHook(() =>
        useUniformField({
          name: 'myField',
          label: 'Visible Label',
          ariaLabel: 'Override Label',
        }),
      );
      expect(result.current.field.ariaLabel).toBe('Override Label');
    });

    it('falls back to name when label is false', () => {
      const { result } = renderHook(() =>
        useUniformField({ name: 'myField', label: false }),
      );
      expect(result.current.field.ariaLabel).toBe('myField');
    });

    it('falls back to name when label is null', () => {
      const { result } = renderHook(() =>
        useUniformField({ name: 'myField', label: null }),
      );
      expect(result.current.field.ariaLabel).toBe('myField');
    });

    it('falls back to name when label is a number', () => {
      const { result } = renderHook(() =>
        useUniformField({ name: 'myField', label: 123 }),
      );
      expect(result.current.field.ariaLabel).toBe('myField');
    });
  });

  describe('showInvalid behavior', () => {
    it('hides errors when field is empty, not touched, and form not submitted', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is empty (null)
      mockField = { ...mockField, value: null };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field has errors but empty, not touched, and no submit attempt -> should not show
      expect(result.current.field.invalid).toBe(false);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Required' }] },
      });
    });

    it('hides errors when field has an initial value but is not dirty', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Too short' }] as FieldError[],
        invalid: true,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field has an initial value, but the user has not changed it.
      mockField = { ...mockField, value: 'ab' };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Invalid initial values stay quiet until the user edits, blurs, or submits.
      expect(result.current.field.invalid).toBe(false);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Too short' }] },
      });
    });

    it('shows errors when a dirty field has a value (even if not touched)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Too short' }] as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field has a user-entered value.
      mockField = { ...mockField, value: 'ab' };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Dirty field with value -> should show error (format errors while typing)
      expect(result.current.field.invalid).toBe(true);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Too short' }] },
      });
    });

    it('shows errors when field is touched (even if empty)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as FieldError[],
        invalid: true,
        isTouched: true,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is empty
      mockField = { ...mockField, value: '' };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field is invalid and touched -> should show error
      expect(result.current.field.invalid).toBe(true);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Required' }] },
      });
    });

    it('shows errors after form submit attempt', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 1;
      // Field value is empty
      mockField = { ...mockField, value: null };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Empty, not touched, but form submitted -> should show errors
      expect(result.current.field.invalid).toBe(true);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Required' }] },
      });
    });

    it('does not show errors when field is invalid but empty/not touched/not submitted', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is empty
      mockField = { ...mockField, value: '' };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Field is invalid but empty/not touched/not submitted -> should NOT show error
      expect(result.current.field.invalid).toBe(false);
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [{ message: 'Required' }] },
      });
    });

    it('does not show invalid when field is actually valid', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: undefined,
        invalid: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Valid field -> should not show invalid
      expect(result.current.field.invalid).toBe(false);
      // valid fields provide an empty error array
      expect(result.current.field.errorMessage).toMatchObject({
        type: FieldValidationError,
        props: { error: [] },
      });
    });

    it('handles flat array wrapper with empty value', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is flat array wrapper with empty inner value
      mockField = {
        ...mockField,
        value: { __FLAT__: null },
      };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Flat wrapper with empty value, not touched, not submitted -> should NOT show error
      expect(result.current.field.invalid).toBe(false);
    });

    it('hides errors for flat array wrapper with initial value but not dirty', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Too short' }] as FieldError[],
        invalid: true,
        isDirty: false,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Flat wrapper has an initial value, but the user has not changed it.
      mockField = {
        ...mockField,
        value: { __FLAT__: 'ab' },
      };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Invalid initial flat values stay quiet until user interaction.
      expect(result.current.field.invalid).toBe(false);
    });

    it('shows errors for dirty flat array wrapper with value', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'Too short' }] as FieldError[],
        invalid: true,
        isDirty: true,
        isTouched: false,
        required: false,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is flat array wrapper with value
      mockField = {
        ...mockField,
        value: { __FLAT__: 'ab' },
      };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Dirty flat wrapper with value -> should show error.
      expect(result.current.field.invalid).toBe(true);
    });

    it('hides errors for empty array (FieldArray)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'At least 1 item required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is empty array
      mockField = { ...mockField, value: [] };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Empty array, not touched, not submitted -> should NOT show error
      expect(result.current.field.invalid).toBe(false);
    });

    it('hides errors for object with all empty values (FieldCard)', () => {
      mockContext.getFieldState = vi.fn(() => ({
        error: [{ message: 'All fields required' }] as FieldError[],
        invalid: true,
        isTouched: false,
        required: true,
        testId: 'f-tid',
      }));
      mockFormState.submitCount = 0;
      // Field value is object with all null values
      mockField = {
        ...mockField,
        value: { a: null, b: '' },
      };

      const { result } = renderHook(() => useUniformField({ name: 'f' }));

      // Object with all empty values, not touched, not submitted -> should NOT show error
      expect(result.current.field.invalid).toBe(false);
    });
  });
});
