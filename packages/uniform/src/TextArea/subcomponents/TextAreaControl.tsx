import type { ComponentProps, MouseEvent } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { TextAreaProps } from '../TextArea';

import { useState } from 'react';
import { Group } from 'react-aria-components';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useObjectRef } from 'react-aria/useObjectRef';
import { useTextField } from 'react-aria/useTextField';
import TextareaAutosize from 'react-textarea-autosize';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import {
  getFieldControlProps,
  getFieldDataAttributes,
} from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { textAreaVariants } from '../textAreaVariants';

interface TextAreaControlProps extends Pick<
  TextAreaProps,
  'className' | 'placeholder'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string>;
}

/**
 * Multiline input presentation with autosizing, focus and field layout
 *
 * @see https://react-aria.adobe.com/useTextField
 * @see https://react-aria.adobe.com/Group
 */
const TextAreaControl = ({
  field,
  className,
  placeholder,
}: TextAreaControlProps) => {
  const {
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
    value,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const styling = useStyling();
  const controlRef = useObjectRef<HTMLTextAreaElement>(inputRef);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const { inputProps } = useTextField(
    {
      ...controlProps,
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

  // zero counts as a filled value
  const hasValue = value !== '' && value != null;

  // classNames from slots
  const variants = styling.resolve(textAreaVariants, {
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
      {...getFieldDataAttributes(field)}
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
              {...controlProps}
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
