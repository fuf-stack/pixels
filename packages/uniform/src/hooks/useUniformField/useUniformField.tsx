import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { UniformFieldState, UseUniformFieldParams } from './types';

import React from 'react';

import { useDebounce } from '@fuf-stack/pixels';

import { flattenFieldErrors, isValueEmpty } from '../../helpers';
import FieldCopyTestIdButton from '../../partials/FieldCopyTestIdButton';
import FieldValidationError from '../../partials/FieldValidationError';
import { useController } from '../useController/useController';
import { useFormContext } from '../useFormContext/useFormContext';
import { useInputValueTransform } from '../useInputValueTransform/useInputValueTransform';

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
 * - Rendered validation messages for field presentation
 * - Computed `label` node which appends a `FieldCopyTestIdButton` in
 *   `debug-testids` mode
 * - `defaultValue` for uncontrolled defaults and all usual field handlers
 * - Access to form utilities: `control`, `getValues`, `resetField`
 * - Owned control IDs and accessible association props for local field composition
 *
 * Private implementation shared by owned Uniform fields.
 */
const useUniformField = <
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
>(
  params: UseUniformFieldParams<TFieldValues, TDisplay>,
): UniformFieldState<TFieldValues> => {
  const {
    name,
    ariaLabel: customAriaLabel,
    disabled = false,
    description,
    isArrayValue = false,
    testId: explicitTestId,
    label,
    placeholder,
    type,
    transform,
  } = params;
  const associationId = React.useId();
  const ids = {
    control: `uniform-${associationId}`,
    label: `uniform-${associationId}-label`,
    description: `uniform-${associationId}-description`,
    error: `uniform-${associationId}-error`,
  };

  const {
    control,
    debugMode,
    formState: { submitCount },
    getFieldState,
    getValues,
    resetField,
  } = useFormContext<TFieldValues>();

  const {
    error: rawError,
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
    fieldOnChange(formValue);
  };

  const defaultValue = (getValues() as Record<string, unknown>)?.[
    name as string
  ];

  /**
   * Determine when to show the invalid state to the user.
   *
   * Show errors when the field is invalid AND any of these conditions are met:
   *   - Field has a user-entered value (show validation errors like format/length while typing)
   *   - Field is touched (focused and blurred) - good for text inputs
   *   - Form has been submitted - shows all errors after submit attempt
   *
   * Note: `hasValue` is gated by `isDirty` so invalid initial values do not
   * show errors just because resolver-backed validation state is available.
   * Newly added empty array elements can be dirty, but stay hidden until blur
   * because they do not have a value yet.
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
  const showInvalid =
    rawInvalid && ((isDirty && hasValue) || isTouched || submitCount > 0);
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

  // Array-like fields can receive nested RHF error objects (index keys, _errors).
  // Opt-in flattening keeps backward compatibility for components that rely on
  // object-shaped errors (e.g. FieldCard/FieldArray).
  const error = isArrayValue ? flattenFieldErrors(rawError) : rawError;
  const normalizedError = flattenFieldErrors(rawError);
  const errorMessage = (
    <FieldValidationError error={normalizedError} testId={testId} />
  );

  // prefer a visible label, use placeholder text only when the field has no label
  const fallbackLabel = !label && placeholder?.trim() ? placeholder : name;
  const ariaLabel =
    customAriaLabel ??
    (label && typeof label === 'string' ? label : fallbackLabel);

  const getControlProps = () => {
    return {
      id: ids.control,
      'aria-label': customAriaLabel ?? (!label ? ariaLabel : undefined),
      'aria-labelledby': !customAriaLabel && label ? ids.label : undefined,
      'aria-describedby':
        [
          description ? ids.description : undefined,
          invalid && normalizedError.length ? ids.error : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
      'aria-invalid': invalid || undefined,
      'aria-required': required || undefined,
    };
  };

  return {
    ariaLabel,
    control,
    debugMode,
    defaultValue,
    disabled: isDisabled,
    description,
    error,
    errorMessage,
    field: {
      ...field,
      value: transformedValue as typeof field.value,
      onChange: transformedOnChange as typeof field.onChange,
    },
    getControlProps,
    ids,
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

export default useUniformField;
