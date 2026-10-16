import type { UniformField } from '../../hooks/useUniformField/types';
import type { FieldControlProps } from '../../partials/types';

interface FieldDataState {
  /** Disables interaction with the field */
  disabled?: boolean;
  /** Marks visible validation failure */
  invalid?: boolean;
  /** Marks a required field */
  required?: boolean;
}

/** Shared styling attributes for field state, inactive flags are omitted */
export const getFieldDataAttributes = ({
  disabled,
  invalid,
  required,
}: FieldDataState) => {
  return {
    'data-disabled': disabled ? true : undefined,
    'data-invalid': invalid ? true : undefined,
    'data-required': required ? true : undefined,
  };
};

/** Field metadata needed to associate an editable control with its content */
type FieldControlState = Pick<
  UniformField,
  | 'ariaLabel'
  | 'customAriaLabel'
  | 'description'
  | 'hasErrors'
  | 'hasLabel'
  | 'ids'
  | 'invalid'
  | 'required'
>;

/** ID and ARIA associations for the editable control or selection group */
export const getFieldControlProps = ({
  ariaLabel,
  customAriaLabel,
  description,
  hasErrors,
  hasLabel,
  ids,
  invalid,
  required,
}: FieldControlState): FieldControlProps => {
  return {
    id: ids.control,
    'aria-label': customAriaLabel ?? (!hasLabel ? ariaLabel : undefined),
    'aria-labelledby': !customAriaLabel && hasLabel ? ids.label : undefined,
    'aria-describedby':
      [
        description ? ids.description : undefined,
        invalid && hasErrors ? ids.error : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': invalid || undefined,
    'aria-required': required || undefined,
  };
};
