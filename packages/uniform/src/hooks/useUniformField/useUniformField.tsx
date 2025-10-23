import type { ReactNode } from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@fuf-stack/pixel-motion';

import { FieldCopyTestIdButton } from '../../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../../partials/FieldValidationError';
import { useController } from '../useController/useController';
import { useFormContext } from '../useFormContext/useFormContext';
import { useInput } from '../useInput/useInput';

/**
 * Debounce invalid state changes for smooth UI transitions while respecting accessibility.
 *
 * Behavior:
 * - Specifically intended for validation invalid flags: debounces both
 *   true → false and false → true transitions by `delayMs` to prevent
 *   flicker and allow enter/exit animations to complete.
 * - If the user prefers reduced motion (via `useReducedMotion` from
 *   `@fuf-stack/pixel-motion`), updates apply immediately with no delay.
 */
const useDebouncedInvalid = (value: boolean, delayMs: number) => {
  const [state, setState] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      // Respect reduced motion: apply immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setState(value);
      return undefined;
    }

    // Debounce any change (true or false) by delayMs
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState(value);
      timeoutRef.current = null;
    }, delayMs);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delayMs, prefersReducedMotion]);

  return state;
};

export interface UseUniformFieldParams<
  TFieldValues extends FieldValues = FieldValues,
> {
  /** Form field name */
  name: Path<TFieldValues> & string;
  /** Disable the field */
  disabled?: boolean;
  /** Optional explicit test id used to build stable test ids */
  testId?: string;
  /** Optional label content; pass false to suppress label entirely */
  label?: ReactNode | false;
  /**
   * When to show the invalid state to users.
   * - 'touched': Only show errors after field is touched or form is submitted (default, good for text inputs)
   * - 'immediate': Show errors as soon as they occur (good for checkboxes, radios, arrays)
   */
  showInvalidWhen?: 'touched' | 'immediate';
}

export interface UseUniformFieldReturn<
  TFieldValues extends FieldValues = FieldValues,
> {
  /** react-hook-form control instance for advanced integrations */
  control: ReturnType<typeof useFormContext<TFieldValues>>['control'];
  /** Debug mode from Uniform provider */
  debugMode: ReturnType<typeof useFormContext<TFieldValues>>['debugMode'];
  /** Current value used to initialize uncontrolled components */
  defaultValue: unknown;
  /** Whether the field is currently disabled (from RHF) */
  disabled: boolean | undefined;
  /** Validation error(s) for the field */
  error: FieldError[] | undefined;
  /** Pre-built errorMessage node to plug into components */
  errorMessage: ReactNode | null;
  /** RHF controller field with nullish conversions applied */
  field: ReturnType<typeof useController<TFieldValues>>['field'];
  /** Helper to spread standardized error message props to underlying components */
  getErrorMessageProps: ReturnType<typeof useInput>['getErrorMessageProps'];
  /** Helper to spread standardized helper wrapper props (for spacing/animation) */
  getHelperWrapperProps: ReturnType<typeof useInput>['getHelperWrapperProps'];
  /** Helper to spread standardized label props to underlying components */
  getLabelProps: ReturnType<typeof useInput>['getLabelProps'];
  /** Access current form values (converted to validation-friendly format) */
  getValues: ReturnType<typeof useFormContext<TFieldValues>>['getValues'];
  /** Whether the field is invalid (debounced for smoother exit animations) */
  invalid: boolean;
  /** Computed label node including optional test id copy button */
  label: ReactNode | null;
  /** onBlur handler from controller */
  onBlur: ReturnType<typeof useController<TFieldValues>>['field']['onBlur'];
  /** onChange handler from controller (with nullish handling) */
  onChange: ReturnType<typeof useController<TFieldValues>>['field']['onChange'];
  /** Ref to forward to underlying control */
  ref: ReturnType<typeof useController<TFieldValues>>['field']['ref'];
  /** Whether the field is required according to validation schema */
  required: boolean;
  /** Reset a specific field in the form */
  resetField: ReturnType<typeof useFormContext<TFieldValues>>['resetField'];
  /** Generated HTML data-testid for the field */
  testId: string;
}

/**
 * Combines frequently used form field logic into a single hook.
 *
 * Provides:
 * - Enhanced form context (validation-aware state, `testId`, value transforms)
 * - Controller field with nullish conversion handling
 * - Debounced `invalid` state with smart timing:
 *   • `true` (field becomes invalid): applies immediately so errors show right away
 *   • `false` (field becomes valid): delayed 200ms to allow smooth exit animations
 *   • Respects `prefers-reduced-motion` by skipping delays when user prefers reduced motion
 * - Smart `invalid` visibility (via `showInvalid`), configurable via `showInvalidWhen`:
 *   • 'touched' (default): Shows errors only after field touched OR form submitted
 *   • 'immediate': Shows errors as soon as validation fails (for checkboxes/radios/arrays)
 *   • Prevents showing errors on pristine fields for better UX
 * - Prebuilt `errorMessage` React node using `FieldValidationError`
 * - Computed `label` node which appends a `FieldCopyTestIdButton` in
 *   `debug-testids` mode
 * - `defaultValue` for uncontrolled defaults and all usual field handlers
 * - Access to form utilities: `control`, `getValues`, `resetField`
 * - Presentation helpers: `getLabelProps`, `getErrorMessageProps`,
 *   `getHelperWrapperProps` for consistent wiring to underlying UI components
 */
export function useUniformField<TFieldValues extends FieldValues = FieldValues>(
  params: UseUniformFieldParams<TFieldValues>,
): UseUniformFieldReturn<TFieldValues> {
  const {
    name,
    disabled = false,
    testId: explicitTestId,
    label,
    showInvalidWhen = 'touched',
  } = params;

  const {
    control,
    debugMode,
    formState: { submitCount },
    getFieldState,
    getValues,
    resetField,
  } = useFormContext<TFieldValues>();

  const {
    error,
    invalid: rawInvalid,
    isTouched,
    required,
    testId,
  } = getFieldState(name, explicitTestId);

  const { field } = useController<TFieldValues>({ control, disabled, name });
  const { onChange, disabled: isDisabled, onBlur, ref } = field;

  const defaultValue = (getValues() as Record<string, unknown>)?.[
    name as string
  ];

  // Debounce invalid changes so validation does not flicker and
  // components can play exit animations
  const invalid = useDebouncedInvalid(rawInvalid, 200);

  /**
   * Determine when to show the invalid state to the user.
   *
   * Behavior depends on `showInvalidWhen` parameter:
   *
   * 'touched' mode (default for text inputs):
   *   - Only show invalid when: field has errors AND (touched OR form submitted)
   *   - Prevents showing errors on pristine fields for better UX
   *   - Example: User loads form with empty required field → no error shown yet
   *
   * 'immediate' mode (for checkboxes, radios, arrays):
   *   - Show invalid as soon as validation fails OR after form submission
   *   - Good for components where user sees immediate feedback per interaction
   *   - Example: Checkbox group with "select at least 2" → error shows immediately
   */
  const showInvalid =
    showInvalidWhen === 'immediate'
      ? invalid || submitCount > 0
      : invalid && (isTouched || submitCount > 0);

  // Build a label node that:
  // - shows the provided label (unless explicitly set to false)
  // - appends a copy-to-clipboard button for the test id in `debug-testids` mode
  // Consumers can pass this directly to component `label` props
  const showTestIdCopyButton = debugMode === 'debug-testids';
  const labelNode: ReactNode | null =
    !!label || showTestIdCopyButton ? (
      <>
        {label !== false ? label : null}
        {showTestIdCopyButton ? (
          <FieldCopyTestIdButton testId={testId} />
        ) : null}
      </>
    ) : null;

  // Ready-to-render error message; consumers can drop this into their
  // component `errorMessage` prop without repeating mapping/markup
  const errorMessage = <FieldValidationError error={error} testId={testId} />;

  // Generate standardized props for label, helper wrapper and error message
  // so consumers can spread them directly into UI components (e.g. HeroUI),
  // keeping animations/spacing consistent across fields
  const { getErrorMessageProps, getLabelProps, getHelperWrapperProps } =
    useInput({
      ref,
      classNames: {
        // set padding to 0 for error message exit animation
        helperWrapper: 'p-0',
      },
      errorMessage: JSON.stringify(error),
      isInvalid: invalid,
      isRequired: required,
      label,
      labelPlacement: 'outside',
    });

  return {
    control,
    debugMode,
    defaultValue,
    disabled: isDisabled,
    error,
    errorMessage,
    field,
    getErrorMessageProps,
    getHelperWrapperProps,
    getLabelProps,
    getValues,
    invalid: showInvalid,
    label: labelNode,
    onBlur,
    onChange,
    ref,
    required,
    resetField,
    testId,
  };
}

export default useUniformField;
