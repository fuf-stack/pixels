import type { ReactNode } from 'react';
import type React from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';
import type { useController } from '../useController/useController';
import type { useFormContext } from '../useFormContext/useFormContext';
import type { InputValueTransform } from '../useInputValueTransform/useInputValueTransform';

import { useInput } from '../useInput/useInput';
import useUniformFieldState from './useUniformFieldState';

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
  /** Optional help text, associated with the editable control. */
  description?: ReactNode;
  /** Normalize nested RHF errors into a flat array for array-like fields */
  isArrayValue?: boolean;
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
  description: ReactNode | undefined;
  /** Validation errors from form state; flattened only when `isArrayValue` is enabled */
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
  /** Owned association props for custom/migrated editable controls. RHF owns validation. */
  getControlProps: () => Pick<
    React.HTMLAttributes<HTMLElement>,
    | 'id'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
  >;
  /** Stable IDs for the control and its local label/help/error elements. */
  ids: {
    control: string;
    label: string;
    description: string;
    error: string;
  };
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

/** Shared field state with the legacy presentation adapter during migration. */
export const useUniformField = <
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
>(
  params: UseUniformFieldParams<TFieldValues, TDisplay>,
): UseUniformFieldReturn<TFieldValues> => {
  const field = useUniformFieldState<TFieldValues, TDisplay>(params);
  const { getLabelProps, getHelperWrapperProps, getErrorMessageProps } =
    useInput({
      ref: field.ref,
      classNames: { helperWrapper: 'p-0' },
      errorMessage: JSON.stringify(field.error),
      isInvalid: field.invalid,
      isRequired: field.required,
      label: params.label,
      labelPlacement: 'outside',
    });
  return {
    ...field,
    getLabelProps,
    getHelperWrapperProps,
    getErrorMessageProps,
  };
};
