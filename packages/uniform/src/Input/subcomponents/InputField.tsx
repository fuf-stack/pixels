import type { ReactNode } from 'react';
import type { InputControlProps } from './InputControl';

import { NumberField, TextField } from 'react-aria-components';

import {
  getFieldControlProps,
  getFieldDataAttributes,
} from '../../helpers/fieldProps/fieldProps';

type InputFieldProps = Pick<InputControlProps, 'field'> & {
  /** Selects the native display type without changing form registration */
  type?: 'text' | 'number' | 'password';
  /** Renders content inside the field */
  children: ReactNode;
  /** CSS class name */
  className?: string;
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
  field,
  type,
  children,
  className = undefined,
  focused,
  hasValue,
  isFocusVisible,
}: InputFieldProps) => {
  const {
    disabled,
    invalid,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    value,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const dataAttributes = getFieldDataAttributes(field);

  // shared root props for the text and number field engines
  const rootProps = {
    ...controlProps,
    ...dataAttributes,
    className,
    'data-component': 'input',
    'data-filled': hasValue || undefined,
    'data-focus': focused || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-slot': 'base',
    isDisabled: disabled,
    isInvalid: invalid,
    isRequired: required,
    name,
    onBlur,
    validationBehavior: 'aria' as const,
  };

  // keep numeric edits as strings at the binding boundary
  const handleNumberChange = (next: number) => {
    onValueChange(Number.isNaN(next) ? '' : String(next));
  };

  // NumberField represents an empty value as NaN
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
