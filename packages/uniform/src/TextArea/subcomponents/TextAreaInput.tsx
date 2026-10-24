import type { ComponentProps, MouseEvent } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { TextAreaProps } from '../TextArea';
import type { TextAreaClassNames } from '../textAreaVariants';

import { useState } from 'react';
import { Group } from 'react-aria-components';
import { useObjectRef } from 'react-aria/useObjectRef';
import { useTextField } from 'react-aria/useTextField';
import TextareaAutosize from 'react-textarea-autosize';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';

interface TextAreaInputProps extends Pick<TextAreaProps, 'placeholder'> {
  /** CSS class name */
  className: TextAreaClassNames;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string>;
  /** Focus within the field */
  focused: boolean;
  /** Whether the field contains a value */
  hasValue: boolean;
  /** Pointer hover state on the input surface */
  hovered: boolean;
  /** Reports hover changes for the field root selectors */
  onHoverChange: (hovered: boolean) => void;
}

/**
 * Autosizing textarea with wrapper focus routing and scroll-limit handling
 *
 * @see https://react-aria.adobe.com/useTextField
 * @see https://react-aria.adobe.com/Group
 */
const TextAreaInput = ({
  className: classNames,
  field,
  focused,
  hasValue,
  hovered,
  onHoverChange,
  placeholder,
}: TextAreaInputProps) => {
  const controlRef = useObjectRef<HTMLTextAreaElement>(field.ref);
  const [limitReached, setLimitReached] = useState(false);

  const {
    disabled,
    invalid,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
    value,
  } = field;
  const controlProps = getFieldControlProps(field);

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

  // the autosizer accepts numeric heights, other ARIA styles remain unchanged
  const inputStyle = inputProps.style
    ? {
        ...inputProps.style,
        height:
          typeof inputProps.style.height === 'number'
            ? inputProps.style.height
            : undefined,
      }
    : undefined;

  // focus the input when its wrapper padding is clicked
  const handleWrapperClick = (event: MouseEvent<HTMLElement>) => {
    if (!disabled && event.target === event.currentTarget) {
      controlRef.current?.focus();
    }
  };

  // track hover for the existing root and wrapper selectors
  const handleHoverStart = () => {
    onHoverChange(true);
  };

  const handleHoverEnd = () => {
    onHoverChange(false);
  };

  // hide scrolling until the eight-row display limit is reached
  const handleHeightChange: NonNullable<
    ComponentProps<typeof TextareaAutosize>['onHeightChange']
  > = (height, { rowHeight }) => {
    setLimitReached(height >= rowHeight * 8);
  };

  return (
    <Group
      className={classNames.inputWrapper}
      data-focus={focused || undefined}
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
          style={inputStyle}
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
  );
};

export default TextAreaInput;
