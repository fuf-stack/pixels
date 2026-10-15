import type { InputControlProps } from './InputControl.types';

import { useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { FieldHints, FieldLabel } from '../../partials/FieldLayout/FieldLayout';
import { inputStateVariants } from '../inputVariants';
import InputContent from './InputContent';
import InputField from './InputField';

/** Own visual state and compose the shared layout beneath the appropriate Aria field. */
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
