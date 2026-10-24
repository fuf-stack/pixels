import type { HTMLAttributes } from 'react';

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
  /** ID of the help text */
  description: string;
  /** ID of the validation message */
  error: string;
  /** ID of the visible label */
  label: string;
}
