import type { HTMLAttributes } from 'react';
import type { InputClasses } from '../inputVariants';
import type { InputControlProps } from './InputControl';

import { Input as AriaInput, Group } from 'react-aria-components';

import { InputClearButton, InputStepper } from './InputActions';

type InputContentProps = Pick<
  InputControlProps,
  | 'clearable'
  | 'controlProps'
  | 'disabled'
  | 'endContent'
  | 'inputRef'
  | 'onClear'
  | 'onFocusControl'
  | 'onValueChange'
  | 'placeholder'
  | 'startContent'
  | 'testId'
  | 'type'
> & {
  /** Resolved Input slot class names. */
  classes: InputClasses;
  /** Whether focus is within the control. */
  focused: boolean;
  /** Focus handlers supplied by the focus ring hook. */
  focusProps: HTMLAttributes<HTMLElement>;
  /** Whether the current value is neither empty nor nullish. */
  hasValue: boolean;
  /** Whether the pointer is over the input wrapper. */
  hovered: boolean;
  /** Update the presentation hover state. */
  onHoverChange: (hovered: boolean) => void;
};

/**
 * Editable input layout built from React Aria Group and Input.
 *
 * Arranges addons, clear actions and number steppers around the native input,
 * forwards its ref and accessibility attributes, and reports wrapper interactions.
 * The surrounding InputField supplies the TextField or NumberField context.
 *
 * @see https://react-aria.adobe.com/Group
 * @see https://react-aria.adobe.com/TextField (Input composition)
 * @see https://react-aria.adobe.com/NumberField (Input and stepper composition)
 */
const InputContent = ({
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
  classes,
  focused,
  focusProps,
  hasValue,
  hovered,
  onHoverChange,
}: InputContentProps) => {
  return (
    <Group
      {...focusProps}
      className={classes.inputWrapper}
      data-focus={focused || undefined}
      data-hover={hovered || undefined}
      data-slot="input-wrapper"
      onClick={(event) => {
        if (!disabled && event.currentTarget === event.target) {
          onFocusControl();
        }
      }}
      onHoverEnd={() => {
        onHoverChange(false);
      }}
      onHoverStart={() => {
        onHoverChange(true);
      }}
    >
      <div className={classes.innerWrapper} data-slot="inner-wrapper">
        {startContent}
        <AriaInput
          {...controlProps}
          ref={inputRef}
          autoComplete="off"
          className={classes.input}
          data-filled={hasValue || undefined}
          data-has-end-content={
            !!endContent || (clearable && hasValue) || undefined
          }
          data-has-start-content={!!startContent || undefined}
          data-slot="input"
          data-testid={testId}
          onChange={
            type === 'number'
              ? (event) => {
                  onValueChange(event.target.value);
                }
              : undefined
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape' && clearable && hasValue) {
              event.preventDefault();
              onClear();
            }
          }}
          placeholder={placeholder}
        />
        {clearable && hasValue ? (
          <InputClearButton
            className={classes.clearButton}
            disabled={disabled}
            onClear={onClear}
          >
            {type !== 'number' && endContent ? endContent : undefined}
          </InputClearButton>
        ) : null}
        {!clearable || type === 'number' ? endContent : null}
        {type === 'number' ? <InputStepper classes={classes} /> : null}
      </div>
    </Group>
  );
};

export default InputContent;
