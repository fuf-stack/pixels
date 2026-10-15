import type { InputControlProps } from './InputControl.types';

import { useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { FieldHints, FieldLabel } from '../../partials/FieldLayout/FieldLayout';
import { inputStateVariants } from '../inputVariants';
import InputContent from './InputContent';
import InputField from './InputField';

/**
 * Composes the Input presentation without registering a form field.
 *
 * Tracks focus with React Aria useFocusRing, resolves slot styling, and arranges
 * the label, editable content and hints beneath InputField's Aria field root.
 * Values, validation state and callbacks are supplied by the Input binding.
 *
 * @see https://react-aria.adobe.com/useFocusRing
 * @see https://react-aria.adobe.com/TextField
 * @see https://react-aria.adobe.com/NumberField
 */
const InputControl = (props: InputControlProps) => {
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
  } = props;

  // Track interaction state locally; form state comes from the binding.
  const {
    focusProps,
    isFocused: focused,
    isFocusVisible,
  } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);

  // Resolve slot styles from the current value and interaction state.
  const styling = useStyling();
  const hasValue = value !== '' && value != null;
  const classes = styling.variantsToClassNames(
    styling.resolve(inputStateVariants, {
      size,
      disabled,
      invalid,
      number: type === 'number',
      clearable,
      filled: hasValue,
    }),
    className,
    'base',
  );

  return (
    <InputField
      {...props}
      classes={classes}
      focused={focused}
      hasValue={hasValue}
      hovered={hovered}
      isFocusVisible={isFocusVisible}
    >
      <FieldLabel
        className={classes.label}
        ids={ids}
        label={label}
        required={required}
      />
      <InputContent
        {...props}
        classes={classes}
        focusProps={focusProps}
        focused={focused}
        hasValue={hasValue}
        hovered={hovered}
        onHoverChange={setHovered}
      />
      <FieldHints
        classes={classes}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </InputField>
  );
};

export default InputControl;
