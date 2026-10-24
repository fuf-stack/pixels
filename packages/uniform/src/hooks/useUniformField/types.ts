import type { ReactNode } from 'react';
import type { FieldError, FieldValues, Path } from 'react-hook-form';
import type { FieldIds } from '../../partials/types';
import type { useFormContext } from '../useFormContext/useFormContext';
import type { InputValueTransform } from '../useInputValueTransform/useInputValueTransform';

export interface UseUniformFieldParams<
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
> {
  /** Custom accessible name, overrides the visible label and fallback names */
  ariaLabel?: string;
  /** Optional help text, associated with the editable control. */
  description?: ReactNode;
  /** Disable the field */
  disabled?: boolean;
  /** Normalize nested RHF errors into a flat array for array-like fields */
  isArrayValue?: boolean;
  /** Optional label content */
  label?: ReactNode;
  /** Form field name */
  name: Path<TFieldValues> & string;
  /** Placeholder text used as the accessible name when no visible label exists */
  placeholder?: string;
  /** Redacts the field value from Uniform diagnostics */
  sensitive?: boolean;
  /** Optional explicit test id used to build stable test ids */
  testId?: string;
  /** Optional value transformation between form and display values */
  transform?: InputValueTransform<TDisplay>;
  /** Input type for special number handling */
  type?: 'text' | 'number' | 'password';
}

/** Values, interactions and metadata for one bound Uniform field */
export interface UniformField<TValue = unknown, TChange = TValue> {
  /** Accessible name */
  ariaLabel: string;
  /** Explicit accessible-name override */
  customAriaLabel: string | undefined;
  /** Current form value for uncontrolled defaults */
  defaultValue: unknown;
  /** Help text associated with the field */
  description: ReactNode | undefined;
  /** Disables the field */
  disabled: boolean | undefined;
  /** Validation errors, flattened when array value handling is enabled */
  error: FieldError[] | undefined;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** Whether validation messages contain errors */
  hasErrors: boolean;
  /** Whether a label was supplied, excluding debug content */
  hasLabel: boolean;
  /** IDs shared by the control, label and messages */
  ids: FieldIds;
  /** Shows validation failure */
  invalid: boolean;
  /** Field label */
  label: ReactNode;
  /** Field name */
  name: string;
  /** Callback when focus leaves the field */
  onBlur: () => void;
  /** Callback with the edited display value */
  onChange: (value: TChange) => void;
  /** Connects form focus requests to the editable control */
  ref: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** Marks the field as required */
  required: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
  /** Current display value */
  value: TValue;
}

export interface UniformFieldState<
  TFieldValues extends FieldValues = FieldValues,
  TDisplay = unknown,
> {
  /** Form control for advanced integrations */
  control: ReturnType<typeof useFormContext<TFieldValues>>['control'];
  /** Debug mode from the Uniform provider */
  debugMode: ReturnType<typeof useFormContext<TFieldValues>>['debugMode'];
  /** Bound field values, interactions and metadata */
  field: UniformField<TDisplay, TDisplay | React.ChangeEvent>;
  /** Programmatic reset notifications for presentation adapters */
  formReset: ReturnType<typeof useFormContext<TFieldValues>>['formReset'];
  /** Reads current form values */
  getValues: ReturnType<typeof useFormContext<TFieldValues>>['getValues'];
  /** Resets a field in the form */
  resetField: ReturnType<typeof useFormContext<TFieldValues>>['resetField'];
}
