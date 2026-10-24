import type { UniformField } from '../../hooks/useUniformField/types';
import type { TextAreaProps } from '../TextArea';

import { useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldDataAttributes } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { textAreaVariants } from '../textAreaVariants';
import TextAreaInput from './TextAreaInput';

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
  const styling = useStyling();
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);

  const {
    description,
    disabled,
    errorMessage,
    ids,
    invalid,
    label,
    required,
    value,
  } = field;

  // zero counts as a filled value
  const hasValue = value !== '' && value != null;

  // classNames from slots
  const variants = styling.resolve(textAreaVariants, {
    disabled,
    invalid,
    filled: hasValue,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <FieldLayout
      baseProps={{
        ...focusProps,
        ...getFieldDataAttributes(field),
        'data-filled': hasValue || undefined,
        'data-focus': isFocused || undefined,
        'data-focus-visible': isFocusVisible || undefined,
        'data-hover': hovered || undefined,
      }}
      className={classNames}
      description={description}
      errorMessage={errorMessage}
      ids={ids}
      invalid={invalid}
      label={label}
      required={required}
    >
      <TextAreaInput
        className={classNames}
        field={field}
        focused={isFocused}
        hasValue={hasValue}
        hovered={hovered}
        onHoverChange={setHovered}
        placeholder={placeholder}
      />
    </FieldLayout>
  );
};

export default TextAreaControl;
