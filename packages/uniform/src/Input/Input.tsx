import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName } from './inputVariants';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformField from '../hooks/useUniformField/useUniformField';
import InputControl from './subcomponents/InputControl';

export { default as inputVariants } from './inputVariants';

export interface InputProps {
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
  /** Hides the password visibility toggle (default: false) */
  hidePasswordToggle?: boolean;
  /** Field label */
  label?: ReactNode;
  /** Field name */
  name: string;
  /** Callback when the input value is cleared */
  onClear?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Redacts diagnostic values, password fields are always redacted */
  sensitive?: boolean;
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
  hidePasswordToggle = false,
  name,
  onClear = undefined,
  placeholder = ' ',
  ...uniformProps
}: InputProps) => {
  const { field, formReset } = useUniformField({
    ...uniformProps,
    name,
    placeholder,
    type,
  });

  // debounce form updates, flush pending edits on blur
  const { value, onChange, onBlur, clear } = useInputValueDebounce({
    debounceDelay,
    emptyValue: '',
    name,
    onBlur: field.onBlur,
    onChange: field.onChange,
    value: field.value,
  });

  return (
    <InputControl
      key={`${name}-${type}-${hidePasswordToggle}`}
      hidePasswordToggle={hidePasswordToggle}
      className={className}
      clearable={clearable}
      endContent={endContent}
      field={{ ...field, onBlur, onChange, value }}
      onClear={onClear}
      onReset={clear}
      placeholder={placeholder}
      size={size}
      startContent={startContent}
      subscribeReset={formReset.subscribe}
      type={type}
    />
  );
};

export default Input;
