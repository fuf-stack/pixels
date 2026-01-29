import type { ReactNode } from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';
import type { InputValueTransform } from '../useInputValueTransform/useInputValueTransform';

import React from 'react';

import { useDebounce } from '@fuf-stack/pixels';

import { isValueEmpty } from '../../helpers';
import { FieldCopyTestIdButton } from '../../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../../partials/FieldValidationError';
import { useController } from '../useController/useController';
import { useFormContext } from '../useFormContext/useFormContext';
import { useInput } from '../useInput/useInput';
import { useInputValueTransform } from '../useInputValueTransform/useInputValueTransform';

export interface UseUniformFieldParams<
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
> {
  /** Form field name */
  name: Path<TFieldValues> & string;
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** Disable the field */
  disabled?: boolean;
  /** Optional label content */
  label?: ReactNode;
  /** Optional explicit test id used to build stable test ids */
  testId?: string;
  /** Optional value transformation between form and display values */
  transform?: InputValueTransform<TDisplay>;
  /** Input type for special number handling */
  type?: 'text' | 'number' | 'password';
}

export interface UseUniformFieldReturn<
  TFieldValues extends FieldValues = FieldValues,
> {
  /** Computed aria-label fallback (field name) when no visible label exists. Components can override based on their accessibility needs (e.g., if placeholder provides sufficient context) */
  ariaLabel: string | undefined;
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
  /** RHF controller field with transformed value/onChange (use this for simple components) */
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
  /** onChange handler from controller (with transform applied) */
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
 * - Value transformation via `transform` prop:
 *   • Allows disentangled display and form values (e.g., string ↔ object, boolean ↔ array)
 *   • Automatically applies `toDisplayValue` to field value for components
 *   • Automatically applies `toFormValue` to display value when onChange is called
 *   • Works with `type` prop for automatic number/string conversion
 *   • Examples: storing objects while displaying strings, storing booleans as arrays, enriching values with metadata
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
export const useUniformField = <
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
>(
  params: UseUniformFieldParams<TFieldValues, TDisplay>,
): UseUniformFieldReturn<TFieldValues> => {
  const {
    name,
    ariaLabel: customAriaLabel,
    disabled = false,
    testId: explicitTestId,
    label,
    type,
    transform,
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

  const { field } = useController<TFieldValues>({
    control,
    disabled,
    name,
  });
  const {
    onChange: fieldOnChange,
    value: fieldValue,
    disabled: isDisabled,
    onBlur,
    ref,
  } = field;

  // Get transform utilities (but don't apply them automatically)
  // Components can choose how to use them (directly or via useInputValueDebounce)
  const { toDisplayValue, toFormValue } = useInputValueTransform<TDisplay>({
    type,
    transform,
  });

  // For components without special needs: apply transform to value and onChange
  const transformedValue = toDisplayValue(fieldValue);
  const transformedOnChange = (eventOrValue: TDisplay | React.ChangeEvent) => {
    // Extract value from event or use value directly
    const displayValue =
      (eventOrValue as React.ChangeEvent<HTMLInputElement>)?.target?.value ??
      eventOrValue;
    const formValue = toFormValue(displayValue as TDisplay);
    fieldOnChange(formValue as typeof fieldValue);
  };

  const defaultValue = (getValues() as Record<string, unknown>)?.[
    name as string
  ];

  /**
   * Determine when to show the invalid state to the user.
   *
   * Show errors when the field is invalid AND any of these conditions are met:
   *   - Field has a value (show validation errors like format/length while typing)
   *   - Field is touched (focused and blurred) - good for text inputs
   *   - Form has been submitted - shows all errors after submit attempt
   *
   * Note: We intentionally don't use isDirty because:
   *   - Newly added array elements are marked "dirty" by RHF, causing immediate errors
   *   - Field Cards with empty initial values show errors immediately
   *   - hasValue + isTouched covers the same use cases more reliably
   *
   * This prevents showing errors on pristine/untouched/empty fields for better UX.
   * Examples:
   *   - Text input: User loads form with empty required field → no error shown yet
   *   - Text input: User types invalid content → error shows immediately (has value)
   *   - Text input: User focuses and blurs without typing → error shows (via isTouched)
   *   - Checkbox/radio: User selects option → error shows immediately (has value)
   *   - Field array: User adds element → no error yet; after blur → error shows
   *   - Any field: User submits form → all errors show (via submitCount)
   *
   * The entire condition is debounced to prevent flickering and allow smooth animations.
   */

  // isValueEmpty handles marker strings, flat array wrappers, empty arrays, and empty objects
  const hasValue = !isValueEmpty(fieldValue);
  const showInvalid = rawInvalid && (hasValue || isTouched || submitCount > 0);
  // Debounce to prevent flickering during rapid state changes
  const invalid = useDebounce(showInvalid, 200);

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

  // Compute aria-label: prefer custom prop, then use string label if available, otherwise field name
  // Components can further override this based on their specific accessibility needs
  // (e.g., Input/TextArea may skip this if they have a meaningful placeholder)
  const ariaLabel =
    customAriaLabel ?? (typeof label === 'string' ? label : name);

  return {
    ariaLabel,
    control,
    debugMode,
    defaultValue,
    disabled: isDisabled,
    error,
    errorMessage,
    field: {
      ...field,
      value: transformedValue as typeof field.value,
      onChange: transformedOnChange as typeof field.onChange,
    },
    getErrorMessageProps,
    getHelperWrapperProps,
    getLabelProps,
    getValues,
    invalid,
    label: labelNode,
    onBlur,
    onChange: transformedOnChange as typeof field.onChange,
    ref,
    required,
    resetField,
    testId,
  };
};
