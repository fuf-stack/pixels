import type { UniformField } from '../../hooks/useUniformField/types';
import type { InputProps } from '../Input';

import { useEffect, useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useObjectRef } from 'react-aria/useObjectRef';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { inputVariants } from '../inputVariants';
import InputField from './InputField';
import InputWrapper from './InputWrapper';

/** Presentation receives values and callbacks; it never registers a form field. */
export interface InputControlProps extends Pick<
  InputProps,
  | 'className'
  | 'clearable'
  | 'endContent'
  | 'hidePasswordToggle'
  | 'onClear'
  | 'placeholder'
  | 'size'
  | 'startContent'
  | 'type'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string>;
  /** Callback that clears pending edits and resets the bound value */
  onReset: () => void;
  /** Subscribes to reset notifications without accessing form context */
  subscribeReset?: (listener: () => void) => () => void;
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
  const { field, subscribeReset } = props;

  const styling = useStyling();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // reset notifications keep presentation independent of form context
  useEffect(() => {
    const handleReset = () => {
      setPasswordVisible(false);
    };

    return subscribeReset?.(handleReset);
  }, [subscribeReset]);

  const controlRef = useObjectRef<HTMLInputElement>(field.ref);
  const {
    focusProps,
    isFocused: focused,
    isFocusVisible,
  } = useFocusRing({
    within: true,
    isTextInput: true,
  });

  const {
    size,
    type,
    clearable,
    className,
    hidePasswordToggle,
    onClear,
    onReset,
  } = props;

  const displayType =
    type === 'password' && !hidePasswordToggle && passwordVisible
      ? 'text'
      : type;

  const {
    value,
    disabled,
    invalid,
    label,
    required,
    ids,
    description,
    errorMessage,
  } = field;

  // treat empty and nullish values as cleared, preserve numeric zero
  const hasValue = value !== '' && value != null;

  // classNames from slots
  const variants = styling.resolve(inputVariants, {
    clearable,
    disabled,
    filled: hasValue,
    invalid,
    number: type === 'number',
    password: type === 'password',
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // focus the editable input
  const handleFocus = () => {
    controlRef.current?.focus();
  };

  // change only the display, the binding keeps its declared password type
  const handleTogglePassword = () => {
    setPasswordVisible((visible) => {
      return !visible;
    });
  };

  // clear the value, notify the consumer and restore input focus
  const handleClear = () => {
    setPasswordVisible(false);
    onReset();
    onClear?.();
    handleFocus();
  };

  return (
    <FieldLayout
      // provide the text or number field engine
      baseAs={InputField}
      baseProps={{
        field,
        focused,
        hasValue,
        isFocusVisible,
        type: displayType,
      }}
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
        onTogglePassword={handleTogglePassword}
        passwordVisible={passwordVisible}
      />
    </FieldLayout>
  );
};

export default InputControl;
