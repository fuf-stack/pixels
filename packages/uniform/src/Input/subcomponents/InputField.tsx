import type { ReactNode } from 'react';
import type { InputClassNames } from '../inputVariants';
import type { InputControlProps } from './InputControl';

import { NumberField, TextField } from 'react-aria-components';

import getFieldDataAttributes from '../../helpers/getFieldDataAttributes/getFieldDataAttributes';

type InputFieldProps = Pick<
  InputControlProps,
  | 'controlProps'
  | 'disabled'
  | 'invalid'
  | 'name'
  | 'onBlur'
  | 'onValueChange'
  | 'required'
  | 'type'
  | 'value'
> & {
  /** Renders content inside the field */
  children: ReactNode;
  /** CSS class name */
  className: InputClassNames;
  /** Shows focus styling while focus is within the control */
  focused: boolean;
  /** Marks the input as filled when the display value is nonempty */
  hasValue: boolean;
  /** Shows the keyboard focus indicator */
  isFocusVisible: boolean;
};

/**
 * React Aria field root for text, password and number inputs.
 *
 * Provides TextField or NumberField context to the editable content and actions,
 * forwards validation/accessibility state, and adapts numeric values to the
 * binding's string display values. Preserves Uniform's root styling selectors.
 *
 * @see https://react-aria.adobe.com/TextField
 * @see https://react-aria.adobe.com/NumberField
 */
const InputField = ({
  controlProps,
  disabled,
  invalid,
  name,
  onBlur,
  onValueChange,
  required,
  type,
  value,
  children,
  className,
  focused,
  hasValue,
  isFocusVisible,
}: InputFieldProps) => {
  const dataAttributes = getFieldDataAttributes({
    disabled,
    invalid,
    required,
  });

  // shared root props for the text and number field engines
  const rootProps = {
    ...controlProps,
    ...dataAttributes,
    name,
    className: className.base,
    'data-slot': 'base',
    'data-focus': focused || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-filled': hasValue || undefined,
    isDisabled: disabled,
    isInvalid: invalid,
    isRequired: required,
    validationBehavior: 'aria' as const,
    onBlur,
  };

  // keep numeric edits as strings at the binding boundary
  const handleNumberChange = (next: number) => {
    onValueChange(Number.isNaN(next) ? '' : String(next));
  };

  // NumberField uses NaN for an empty value and strings at the binding boundary.
  if (type === 'number') {
    const numericValue = value !== '' && value != null ? Number(value) : NaN;
    return (
      <NumberField
        {...rootProps}
        formatOptions={{ useGrouping: false }}
        onChange={handleNumberChange}
        value={numericValue}
      >
        {children}
      </NumberField>
    );
  }

  return (
    <TextField
      {...rootProps}
      onChange={onValueChange}
      type={type ?? 'text'}
      value={String(value ?? '')}
    >
      {children}
    </TextField>
  );
};

export default InputField;
