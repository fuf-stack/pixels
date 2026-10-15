import type { ReactNode, Ref } from 'react';
import type {
  FieldControlProps,
  FieldIds,
} from '../../partials/FieldLayout/FieldLayout.types';
import type { InputProps } from '../Input';
import type { inputStateVariants } from '../inputVariants';

/** Presentation receives values and callbacks; it never registers a form field. */
export interface InputControlProps extends Pick<
  InputProps,
  | 'className'
  | 'clearable'
  | 'description'
  | 'disabled'
  | 'endContent'
  | 'label'
  | 'name'
  | 'placeholder'
  | 'size'
  | 'startContent'
  | 'testId'
  | 'type'
> {
  /** Native attributes connecting the editable control to its label and hints. */
  controlProps: FieldControlProps;
  /** Validation message rendered beneath an invalid control. */
  errorMessage: ReactNode;
  /** Stable IDs for the control, label, description and validation message. */
  ids: FieldIds;
  /** Ref forwarded to the native editable input. */
  inputRef: Ref<HTMLInputElement>;
  /** Whether the control displays its invalid state. */
  invalid: boolean;
  /** Notify the binding when focus leaves the field. */
  onBlur: () => void;
  /** Clear the bound value and restore focus to the input. */
  onClear: () => void;
  /** Focus the native input when its wrapper is clicked. */
  onFocusControl: () => void;
  /** Forward the next display value to the binding. */
  onValueChange: (value: string) => void;
  /** Whether the label and control expose a required state. */
  required: boolean;
  /** Current display value; nullish values render as an empty input. */
  value: unknown;
}

/** Resolved class names for every Input styling slot. */
export type InputClasses = Record<
  keyof ReturnType<typeof inputStateVariants>,
  string
>;
