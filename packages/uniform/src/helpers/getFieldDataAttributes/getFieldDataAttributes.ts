interface FieldDataState {
  /** Disables interaction with the field */
  disabled?: boolean;
  /** Marks visible validation failure */
  invalid?: boolean;
  /** Marks a required field */
  required?: boolean;
}

/** Shared styling attributes for field state, inactive flags are omitted */
const getFieldDataAttributes = ({
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

export default getFieldDataAttributes;
