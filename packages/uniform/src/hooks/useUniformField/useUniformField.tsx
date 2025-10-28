import type { ReactNode } from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { useDebounce } from '@fuf-stack/pixels';

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
const useDebouncedInvalid = (invalid: boolean, delayMs: number) => {
  const prefersReducedMotion = useReducedMotion();
  const debouncedInvalid = useDebounce(invalid, delayMs);

  // If user prefers reduced motion, return invalid immediately without debouncing
  return prefersReducedMotion ? invalid : debouncedInvalid;
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
  /** Whether the field should show invalid state (debounced for smooth animations). True when field is invalid AND (dirty OR touched OR submitted) */
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
 * - Smart `invalid` visibility (via `showInvalid`):
 *   • Shows errors when field is dirty OR touched OR form has been submitted
 *   • Prevents showing errors on pristine/untouched fields for better UX
 *   • Works well for all field types (text inputs, checkboxes, radios, arrays)
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
  const { name, disabled = false, testId: explicitTestId, label } = params;

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
    isDirty,
    isTouched,
    required,
    testId,
  } = getFieldState(name, explicitTestId);

  const { field } = useController<TFieldValues>({
    control,
    disabled,
    name,
  });
  const { onChange, disabled: isDisabled, onBlur, ref } = field;

  const defaultValue = (getValues() as Record<string, unknown>)?.[
    name as string
  ];

  /**
   * Determine when to show the invalid state to the user.
   *
   * Show errors when the field is invalid AND any of these conditions are met:
   *   - Field is dirty (value changed from initial) - good for checkboxes/radios/arrays
   *   - Field is touched (focused and blurred) - good for text inputs
   *   - Form has been submitted - shows all errors after submit attempt
   *
   * This prevents showing errors on pristine/untouched fields for better UX.
   * Examples:
   *   - Text input: User loads form with empty required field → no error shown yet
   *   - Text input: User focuses and blurs → error shows (via isTouched)
   *   - Checkbox group: User clicks first checkbox → error shows immediately (via isDirty)
   *   - Any field: User submits form → all errors show (via submitCount)
   *
   * The entire condition is debounced to prevent flickering and allow smooth animations
   * when any of the states (invalid, isDirty, isTouched, submitCount) change.
   */
  const showInvalid = rawInvalid && (isDirty || isTouched || submitCount > 0);
  const invalid = useDebouncedInvalid(showInvalid, 200);

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
    invalid,
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
