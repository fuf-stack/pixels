import type { ReactNode } from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';
import type {
  FieldControlProps,
  FieldIds,
} from '../../partials/FieldLayout/FieldLayout.types';
import type { useController } from '../useController/useController';
import type { useFormContext } from '../useFormContext/useFormContext';
import type { InputValueTransform } from '../useInputValueTransform/useInputValueTransform';

export interface UseUniformFieldStateParams<
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

export interface UniformFieldState<
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
  /** Owned association props for custom/migrated editable controls. RHF owns validation. */
  getControlProps: () => FieldControlProps;
  /** Stable IDs for the control and its local label/help/error elements. */
  ids: FieldIds;
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
