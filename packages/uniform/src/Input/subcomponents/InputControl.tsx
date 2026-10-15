import type { ReactNode, Ref } from 'react';
import type {
  FieldControlProps,
  FieldIds,
} from '../../partials/FieldLayout/FieldLayout.types';
import type { InputProps } from '../Input';

import { useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { FieldHints, FieldLabel } from '../../partials/FieldLayout/FieldLayout';
import { inputStateVariants } from '../inputVariants';
import InputContent from './InputContent';
import InputField from './InputField';

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
  | 'placeholder'
  | 'size'
  | 'startContent'
  | 'testId'
  | 'type'
> {
  /** Native attributes connecting the editable control to its label and hints. */
  controlProps: FieldControlProps;
  /** Validation message rendered beneath an invalid control. */
  errorMessage: ReactNode;
  /** Stable IDs for the control, label, description and validation message. */
  ids: FieldIds;
  /** Ref forwarded to the native editable input. */
  inputRef: Ref<HTMLInputElement>;
  /** Whether the control displays its invalid state. */
  invalid: boolean;
  /** Notify the binding when focus leaves the field. */
  onBlur: () => void;
  /** Clear the bound value and restore focus to the input. */
  onClear: () => void;
  /** Focus the native input when its wrapper is clicked. */
  onFocusControl: () => void;
  /** Forward the next display value to the binding. */
  onValueChange: (value: string) => void;
  /** Whether the label and control expose a required state. */
  required: boolean;
  /** Current display value; nullish values render as an empty input. */
  value: unknown;
}

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
