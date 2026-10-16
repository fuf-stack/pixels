import type { HTMLAttributes, ReactNode } from 'react';

/** Native control attributes associating a field with its label, hints and validation */
export type FieldControlProps = Pick<
  HTMLAttributes<HTMLElement>,
  | 'id'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-invalid'
  | 'aria-required'
>;

/** Stable IDs shared by a field's control and surrounding presentation */
export interface FieldIds {
  /** ID of the editable control */
  control: string;
  /** ID of the visible label */
  label: string;
  /** ID of the help text */
  description: string;
  /** ID of the validation message */
  error: string;
}

/** Bound values and associations supplied to field presentation */
export interface FieldPresentationProps<TValue = unknown, TChange = TValue> {
  /** Attributes associating the control with its label and messages */
  controlProps: FieldControlProps;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** IDs shared with the field label and messages */
  ids: FieldIds;
  /** Shows validation failure */
  invalid: boolean;
  /** Callback when focus leaves the field */
  onBlur: () => void;
  /** Callback with the edited display value */
  onValueChange: (value: TChange) => void;
  /** Marks the field as required */
  required: boolean;
  /** Current display value */
  value: TValue;
}
