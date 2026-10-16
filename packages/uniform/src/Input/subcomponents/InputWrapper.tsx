import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import type { FocusRingAria } from 'react-aria/useFocusRing';
import type { InputClassNames } from '../inputVariants';
import type { InputControlProps } from './InputControl';

import { Input as AriaInput, Group } from 'react-aria-components';

import InputClearButton from './InputClearButton';
import InputStepper from './InputStepper';

type InputWrapperProps = Pick<
  InputControlProps,
  | 'clearable'
  | 'controlProps'
  | 'disabled'
  | 'endContent'
  | 'inputRef'
  | 'onValueChange'
  | 'placeholder'
  | 'startContent'
  | 'testId'
  | 'type'
> & {
  /** CSS class name */
  className: InputClassNames;
  /** Shows focus styling while focus is within the control */
  focused: boolean;
  /** Connects the wrapper to the focus ring handlers */
  focusProps: Pick<FocusRingAria['focusProps'], 'onBlur' | 'onFocus'>;
  /** Marks the input as filled when the display value is nonempty */
  hasValue: boolean;
  /** Callback when the clear button or Escape key clears the input */
  onClear: () => void;
  /** Callback invoked to focus the input after a wrapper click */
  onFocusControl: () => void;
};

/**
 * Bordered input surface built from React Aria Group and Input
 *
 * Arranges addons, clear actions and number steppers around the native input,
 * forwards its ref and accessibility attributes, and reports wrapper interactions.
 * The surrounding InputField supplies the TextField or NumberField context.
 *
 * @see https://react-aria.adobe.com/Group
 * @see https://react-aria.adobe.com/TextField (Input composition)
 * @see https://react-aria.adobe.com/NumberField (Input and stepper composition)
 */
const InputWrapper = ({
  clearable = false,
  controlProps,
  disabled,
  endContent,
  inputRef,
  onClear,
  onFocusControl,
  onValueChange,
  placeholder,
  startContent,
  testId,
  type,
  className,
  focused,
  focusProps,
  hasValue,
}: InputWrapperProps) => {
  // focus the input when its wrapper padding is clicked
  const handleWrapperClick = (event: MouseEvent<HTMLElement>) => {
    if (!disabled && event.currentTarget === event.target) {
      onFocusControl();
    }
  };

  // forward the raw number text to the value handler
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
  };

  // clear a populated input when Escape is pressed
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && clearable && hasValue) {
      event.preventDefault();
      onClear();
    }
  };

  return (
    <Group
      {...focusProps}
      className={className.inputWrapper}
      data-focus={focused || undefined}
      data-slot="input-wrapper"
      isDisabled={disabled}
      onClick={handleWrapperClick}
    >
      <div className={className.innerWrapper} data-slot="inner-wrapper">
        {startContent}
        <AriaInput
          {...controlProps}
          ref={inputRef}
          autoComplete="off"
          className={className.input}
          data-filled={hasValue || undefined}
          data-has-end-content={
            !!endContent || (clearable && hasValue) || undefined
          }
          data-has-start-content={!!startContent || undefined}
          data-slot="input"
          data-testid={testId}
          onChange={type === 'number' ? handleChange : undefined}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        {clearable && hasValue ? (
          <InputClearButton
            className={className.clearButton}
            disabled={disabled}
            onClear={onClear}
          >
            {type !== 'number' && endContent ? endContent : undefined}
          </InputClearButton>
        ) : null}
        {!clearable || type === 'number' ? endContent : null}
        {type === 'number' ? <InputStepper className={className} /> : null}
      </div>
    </Group>
  );
};

export default InputWrapper;
