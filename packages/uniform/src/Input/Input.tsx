import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type inputVariants from './inputVariants';

import { useRef } from 'react';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformFieldState from '../hooks/useUniformFieldState/useUniformFieldState';
import InputControl from './subcomponents/InputControl';

export { default as inputVariants } from './inputVariants';

type VariantProps = TVProps<typeof inputVariants>;
type ClassName = TVClassName<typeof inputVariants>;

export interface InputProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** shows clear button when input has value */
  clearable?: boolean;
  /** debounce delay in milliseconds for form state updates (default: 300ms) */
  debounceDelay?: number;
  /** Help text associated with the editable control. */
  description?: ReactNode;
  /** input field is disabled */
  disabled?: boolean;
  /** added content to the end of the input Field. */
  endContent?: ReactNode;
  /** form field label */
  label?: ReactNode;
  /** form field name */
  name: string;
  /** callback that is fired when the value is cleared */
  onClear?: () => void;
  /** form field placeholder */
  placeholder?: string;
  /** size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transform?: InputValueTransform<string>;
  /** input type */
  type?: 'number' | 'password';
}

/** Bind one Uniform field to the independent input presentation. */
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
  // Use the placeholder as the accessible name when no visible label is provided.
  const ariaLabel =
    uniformProps.ariaLabel ??
    (!uniformProps.label && placeholder.trim() ? placeholder : undefined);

  // Register the field and resolve its label, hints and validation state.
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
    resetField,
    testId,
    getControlProps,
  } = useUniformFieldState({
    name,
    type,
    ...uniformProps,
    ariaLabel,
  });

  // Keep the native input available for focus after clearing or wrapper clicks.
  const controlRef = useRef<HTMLInputElement>(null);

  // Update the displayed value immediately; debounce writes to form state.
  const { value, onChange, onBlur, cancelPendingChange } =
    useInputValueDebounce({
      name,
      debounceDelay,
      value: field.value,
      onChange: field.onChange,
      onBlur: field.onBlur,
    });

  // Cancel queued edits before resetting, so they cannot restore the old value.
  const clear = () => {
    cancelPendingChange('');
    resetField(name, { defaultValue: null });

    onClear?.();
    controlRef.current?.focus();
  };

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
      inputRef={(node) => {
        controlRef.current = node;
        ref(node);
      }}
      invalid={invalid}
      label={label}
      name={name}
      onBlur={onBlur}
      onClear={clear}
      onFocusControl={() => {
        controlRef.current?.focus();
      }}
      onValueChange={(next) => {
        onChange({ target: { value: next } });
      }}
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
