import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { UniformFieldState, UseUniformFieldParams } from './types';

import React from 'react';

import { useDebounce } from '@fuf-stack/pixels';

import { useSensitiveField } from '../../Form/subcomponents/SensitiveFields';
import { flattenFieldErrors, isValueEmpty } from '../../helpers';
import FieldCopyTestIdButton from '../../partials/FieldCopyTestIdButton';
import FieldValidationError from '../../partials/FieldValidationError';
import { useController } from '../useController/useController';
import { useFormContext } from '../useFormContext/useFormContext';
import { useInputValueTransform } from '../useInputValueTransform/useInputValueTransform';

/** Binds a field's value, validation, label and accessible associations */
const useUniformField = <
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
>(
  params: UseUniformFieldParams<TFieldValues, TDisplay>,
): UniformFieldState<TFieldValues, TDisplay> => {
  // field configuration
  const {
    name,
    ariaLabel: customAriaLabel,
    disabled = false,
    description,
    isArrayValue = false,
    testId: explicitTestId,
    label,
    placeholder,
    sensitive = false,
    type,
    transform,
  } = params;

  // revealing a password never changes its diagnostic redaction
  useSensitiveField(name, type === 'password' || sensitive);

  // stable associations between the control, label and messages
  const associationId = React.useId();
  const ids = {
    control: `uniform-${associationId}`,
    label: `uniform-${associationId}-label`,
    description: `uniform-${associationId}-description`,
    error: `uniform-${associationId}-error`,
  };

  // form operations and submission state
  const {
    control,
    debugMode,
    formState: { submitCount },
    formReset,
    getFieldState,
    getValues,
    resetField,
  } = useFormContext<TFieldValues>();

  // validation and interaction state
  const {
    error: rawError,
    invalid: rawInvalid,
    isDirty,
    isTouched,
    required,
    testId,
  } = getFieldState(name, explicitTestId);

  // register the field and connect its value and callbacks
  const { field: controllerField } = useController<TFieldValues>({
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
  } = controllerField;

  // convert between stored form values and displayed values
  const { toDisplayValue, toFormValue } = useInputValueTransform<TDisplay>({
    transform,
    type,
  });

  const transformedValue = toDisplayValue(fieldValue);
  const transformedOnChange = (eventOrValue: TDisplay | React.ChangeEvent) => {
    // accept native events as well as direct values
    const displayValue =
      (eventOrValue as React.ChangeEvent<HTMLInputElement>)?.target?.value ??
      eventOrValue;
    const formValue = toFormValue(displayValue as TDisplay);
    fieldOnChange(formValue);
  };

  const defaultValue = (getValues() as Record<string, unknown>)?.[
    name as string
  ];

  // show errors after editing a nonempty value, blur or submission
  const hasValue = !isValueEmpty(fieldValue);
  const showInvalid =
    rawInvalid && ((isDirty && hasValue) || isTouched || submitCount > 0);

  // allow validation messages to finish their exit animation
  const invalid = useDebounce(showInvalid, 200);

  // include the test ID action when debugging fields
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

  // preserve nested errors for groups, flatten messages for rendering
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

  // collect the bound field without exposing controller internals
  const field = {
    ariaLabel,
    customAriaLabel,
    defaultValue,
    description,
    disabled: isDisabled,
    error,
    errorMessage,
    hasErrors: normalizedError.length > 0,
    hasLabel: !!label,
    ids,
    invalid,
    label: labelNode,
    name: controllerField.name,
    onBlur,
    onChange: transformedOnChange,
    ref,
    required,
    testId,
    value: transformedValue,
  };

  return {
    control,
    debugMode,
    field,
    formReset,
    getValues,
    resetField,
  };
};

export default useUniformField;
