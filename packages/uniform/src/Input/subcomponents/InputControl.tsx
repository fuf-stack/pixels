import type { ReactNode, Ref } from 'react';
import type { FieldControlProps, FieldIds } from '../../partials/types';
import type { InputProps } from '../Input';

import { useFocusRing } from 'react-aria/useFocusRing';
import { useObjectRef } from 'react-aria/useObjectRef';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { inputStateVariants } from '../inputVariants';
import InputField from './InputField';
import InputWrapper from './InputWrapper';

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
  | 'onClear'
  | 'placeholder'
  | 'size'
  | 'startContent'
  | 'testId'
  | 'type'
> {
  /** Connects the native control to its label and hints */
  controlProps: FieldControlProps;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** Associates the control, label, description and validation message through stable IDs */
  ids: FieldIds;
  /** Ref forwarded to the native editable input */
  inputRef: Ref<HTMLInputElement>;
  /** Shows invalid styling on the control */
  invalid: boolean;
  /** Callback invoked when focus leaves the field */
  onBlur: () => void;
  /** Callback that clears pending edits and resets the bound value */
  onReset: () => void;
  /** Callback invoked with the next display value when the input changes */
  onValueChange: (value: string) => void;
  /** Marks the label and control as required */
  required: boolean;
  /** Sets the display value, nullish values render as an empty input */
  value: unknown;
}

/**
 * Composes the Input presentation without registering a form field.
 *
 * Owns the editable ref, focus restoration and interaction styling.
 * Connects InputField's Aria field root, FieldLayout and the editable content.
 * Values, validation state and callbacks are supplied by the Input binding.
 *
 * @see https://react-aria.adobe.com/useFocusRing
 * @see https://react-aria.adobe.com/TextField
 * @see https://react-aria.adobe.com/NumberField
 */
const InputControl = (props: InputControlProps) => {
  const { inputRef } = props;

  const styling = useStyling();
  const controlRef = useObjectRef(inputRef);
  const {
    focusProps,
    isFocused: focused,
    isFocusVisible,
  } = useFocusRing({
    within: true,
    isTextInput: true,
  });

  const {
    value,
    size,
    disabled,
    invalid,
    type,
    clearable,
    className,
    label,
    required,
    ids,
    description,
    errorMessage,
    onClear,
    onReset,
  } = props;

  // treat empty and nullish values as cleared, preserve numeric zero
  const hasValue = value !== '' && value != null;

  // classNames from slots
  const variants = styling.resolve(inputStateVariants, {
    clearable,
    disabled,
    filled: hasValue,
    invalid,
    number: type === 'number',
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // focus the editable input
  const handleFocus = () => {
    controlRef.current?.focus();
  };

  // clear the value, notify the consumer and restore input focus
  const handleClear = () => {
    onReset();
    onClear?.();
    handleFocus();
  };

  return (
    <InputField
      {...props}
      className={classNames}
      focused={focused}
      hasValue={hasValue}
      isFocusVisible={isFocusVisible}
    >
      <FieldLayout
        className={classNames}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
        label={label}
        required={required}
      >
        <InputWrapper
          {...props}
          className={classNames}
          focusProps={focusProps}
          focused={focused}
          hasValue={hasValue}
          inputRef={controlRef}
          onClear={handleClear}
          onFocusControl={handleFocus}
        />
      </FieldLayout>
    </InputField>
  );
};

export default InputControl;
