import type { ReactNode } from 'react';
import type { InputClasses, InputControlProps } from './InputControl.types';

import { NumberField, TextField } from 'react-aria-components';

type InputFieldProps = Pick<
  InputControlProps,
  | 'controlProps'
  | 'disabled'
  | 'invalid'
  | 'label'
  | 'name'
  | 'onBlur'
  | 'onValueChange'
  | 'placeholder'
  | 'required'
  | 'startContent'
  | 'type'
  | 'value'
> & {
  /** Content rendered inside the field. */
  children: ReactNode;
  /** Resolved Input slot class names. */
  classes: InputClasses;
  /** Whether focus is within the control. */
  focused: boolean;
  /** Whether the current value is neither empty nor nullish. */
  hasValue: boolean;
  /** Whether the pointer is over the input wrapper. */
  hovered: boolean;
  /** Whether the control shows a keyboard focus indicator. */
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
  label,
  name,
  onBlur,
  onValueChange,
  placeholder,
  required,
  startContent,
  type,
  value,
  children,
  classes,
  focused,
  hasValue,
  hovered,
  isFocusVisible,
}: InputFieldProps) => {
  // Both Aria field engines expose the same root associations and state selectors.
  const rootProps = {
    ...controlProps,
    name,
    className: classes.base,
    'data-slot': 'base',
    'data-focus': focused || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-hover': hovered || undefined,
    'data-filled': hasValue || !!placeholder || !!startContent || undefined,
    'data-filled-within':
      hasValue || focused || !!placeholder || !!startContent || undefined,
    'data-focus-within': focused || undefined,
    'data-required': required || undefined,
    'data-has-label': !!label || undefined,
    'data-has-helper': true,
    'data-has-elements': true,
    'data-has-value': hasValue || !placeholder || undefined,
    'data-disabled': disabled ? true : undefined,
    'data-invalid': invalid || undefined,
    isDisabled: disabled,
    isInvalid: invalid,
    isRequired: required,
    validationBehavior: 'aria' as const,
    onBlur: () => {
      onBlur();
    },
  };

  // NumberField uses NaN for an empty value and strings at the binding boundary.
  if (type === 'number') {
    const numericValue = value !== '' && value != null ? Number(value) : NaN;
    return (
      <NumberField
        {...rootProps}
        formatOptions={{ useGrouping: false }}
        onChange={(next) => {
          onValueChange(Number.isNaN(next) ? '' : String(next));
        }}
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
