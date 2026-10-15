import type { HTMLAttributes } from 'react';
import type { InputClasses, InputControlProps } from './InputControl.types';

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

/** Shared editable layout, addons and actions; no form state or registration. */
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
