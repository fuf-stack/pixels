import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName, VariantProps } from './inputVariants';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformField from '../hooks/useUniformField/useUniformField';
import InputControl from './subcomponents/InputControl';

export { default as inputVariants } from './inputVariants';

export interface InputProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Shows a clear button when the input has a value */
  clearable?: boolean;
  /** Delay in milliseconds before updating form state (default: 300) */
  debounceDelay?: number;
  /** Help text associated with the input */
  description?: ReactNode;
  /** Disables the input */
  disabled?: boolean;
  /** Content at the end of the input */
  endContent?: ReactNode;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /** Callback when the input value is cleared */
  onClear?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Content at the start of the input */
  startContent?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Conversion between display and form values */
  transform?: InputValueTransform<string>;
  /** Input type */
  type?: 'number' | 'password';
}

/** Form input field for text, passwords or numbers */
const Input = ({
  className = undefined,
  clearable = false,
  debounceDelay = 300,
  endContent = undefined,
  startContent = undefined,
  size = 'md',
  type = undefined,
  name,
  onClear = undefined,
  placeholder = ' ',
  ...uniformProps
}: InputProps) => {
  const {
    field,
    disabled,
    invalid,
    required,
    label,
    description,
    errorMessage,
    ids,
    ref,
    testId,
    getControlProps,
  } = useUniformField({
    ...uniformProps,
    name,
    placeholder,
    type,
  });

  // debounce form updates, flush pending edits on blur
  const { value, onChange, onBlur, clear } = useInputValueDebounce({
    name,
    debounceDelay,
    emptyValue: '',
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
  });

  return (
    <InputControl
      className={className}
      clearable={clearable}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      endContent={endContent}
      errorMessage={errorMessage}
      ids={ids}
      inputRef={ref}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={onBlur}
      onClear={onClear}
      onReset={clear}
      onValueChange={onChange}
      placeholder={placeholder}
      required={required}
      size={size}
      startContent={startContent}
      testId={testId}
      type={type}
      value={value}
    />
  );
};

export default Input;
