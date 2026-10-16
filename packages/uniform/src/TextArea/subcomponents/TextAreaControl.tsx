import type { ComponentProps, MouseEvent, Ref } from 'react';
import type { FieldControlProps, FieldIds } from '../../partials/types';
import type { TextAreaProps } from '../TextArea';

import { useState } from 'react';
import { Group } from 'react-aria-components';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useObjectRef } from 'react-aria/useObjectRef';
import { useTextField } from 'react-aria/useTextField';
import TextareaAutosize from 'react-textarea-autosize';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import getFieldDataAttributes from '../../helpers/getFieldDataAttributes/getFieldDataAttributes';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { textAreaStateVariants } from '../textAreaVariants';

interface TextAreaControlProps extends Pick<
  TextAreaProps,
  | 'className'
  | 'description'
  | 'disabled'
  | 'label'
  | 'name'
  | 'placeholder'
  | 'testId'
> {
  /** Attributes associating the input with its label and messages */
  controlProps: FieldControlProps;
  /** Rendered validation messages */
  errorMessage: React.ReactNode;
  /** IDs shared with the field layout */
  ids: FieldIds;
  /** Ref forwarded to the editable textarea */
  inputRef: Ref<HTMLTextAreaElement>;
  /** Shows validation failure */
  invalid: boolean;
  /** Callback when focus leaves the field */
  onBlur: () => void;
  /** Callback with the edited text */
  onValueChange: (value: string) => void;
  /** Marks the field as required */
  required: boolean;
  /** Current display value */
  value: unknown;
}

/**
 * Multiline input presentation with autosizing, focus and field layout
 *
 * @see https://react-aria.adobe.com/useTextField
 * @see https://react-aria.adobe.com/Group
 */
const TextAreaControl = ({
  className,
  controlProps,
  description,
  disabled,
  errorMessage,
  ids,
  inputRef,
  invalid,
  label,
  name,
  onBlur,
  onValueChange,
  placeholder,
  required,
  testId,
  value,
}: TextAreaControlProps) => {
  const controlRef = useObjectRef(inputRef);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const hasValue = value !== '' && value != null;
  const associations = controlProps;
  const { inputProps } = useTextField(
    {
      ...associations,
      inputElementType: 'textarea',
      name,
      value: String(value ?? ''),
      onChange: onValueChange,
      onBlur,
      isDisabled: disabled,
      isInvalid: invalid,
      isRequired: required,
      validationBehavior: 'aria',
    },
    controlRef,
  );
  const styling = useStyling();
  // classNames from slots
  const variants = styling.resolve(textAreaStateVariants, {
    disabled,
    invalid,
    filled: hasValue,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // focus the input when its wrapper padding is clicked
  const handleWrapperClick = (event: MouseEvent<HTMLElement>) => {
    if (!disabled && event.target === event.currentTarget) {
      controlRef.current?.focus();
    }
  };

  // track hover for the existing root and wrapper selectors
  const handleHoverStart = () => {
    setHovered(true);
  };
  const handleHoverEnd = () => {
    setHovered(false);
  };

  // hide scrolling until the eight-row display limit is reached
  const handleHeightChange: NonNullable<
    ComponentProps<typeof TextareaAutosize>['onHeightChange']
  > = (height, { rowHeight }) => {
    setLimitReached(height >= rowHeight * 8);
  };

  return (
    <div
      {...focusProps}
      {...getFieldDataAttributes({ disabled, invalid, required })}
      className={classNames.base}
      data-filled={hasValue || undefined}
      data-focus={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-hover={hovered || undefined}
      data-slot="base"
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
        <Group
          className={classNames.inputWrapper}
          data-focus={isFocused || undefined}
          data-hover={hovered || undefined}
          data-slot="input-wrapper"
          isDisabled={disabled}
          onClick={handleWrapperClick}
          onHoverEnd={handleHoverEnd}
          onHoverStart={handleHoverStart}
          role="presentation"
        >
          <div className={classNames.innerWrapper} data-slot="inner-wrapper">
            <TextareaAutosize
              {...inputProps}
              {...associations}
              ref={controlRef}
              className={classNames.input}
              data-filled={hasValue || undefined}
              data-hide-scroll={!limitReached || undefined}
              data-slot="input"
              data-testid={testId}
              maxRows={8}
              minRows={3}
              onHeightChange={handleHeightChange}
              placeholder={placeholder}
            />
          </div>
        </Group>
      </FieldLayout>
    </div>
  );
};

export default TextAreaControl;
