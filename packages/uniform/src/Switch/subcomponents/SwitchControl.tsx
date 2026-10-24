import type { UniformField } from '../../hooks/useUniformField/types';
import type { SwitchProps } from '../Switch';

import { mergeProps } from 'react-aria/mergeProps';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { useObjectRef } from 'react-aria/useObjectRef';
import { useSwitch } from 'react-aria/useSwitch';
import { VisuallyHidden } from 'react-aria/VisuallyHidden';
import { useToggleState } from 'react-stately/useToggleState';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { switchVariants } from '../switchVariants';
import SwitchTrack from './SwitchTrack';

interface SwitchControlProps extends Pick<
  SwitchProps,
  'className' | 'endContent' | 'size' | 'startContent' | 'thumbIcon'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, boolean>;
}

/**
 * Switch presentation with native input, focus and thumb content
 *
 * @see https://react-aria.adobe.com/useSwitch
 */
const SwitchControl = ({
  field,
  className,
  size,
  thumbIcon,
  endContent,
  startContent,
}: SwitchControlProps) => {
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
  const controlRef = useObjectRef<HTMLInputElement>(inputRef);
  const state = useToggleState({
    isSelected: !!value,
    onChange: onValueChange,
  });
  const { inputProps, labelProps, isPressed } = useSwitch(
    {
      ...controlProps,
      children: label,
      isDisabled: disabled,
      isInvalid: invalid,
      isRequired: required,
      name,
      onBlur,
      validationBehavior: 'aria',
    },
    state,
    controlRef,
  );
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // classNames from slots
  const variants = styling.resolve(switchVariants, { size, disabled });
  const classNames = styling.variantsToClassNames(
    variants,
    className,
    'outerWrapper',
  );

  return (
    <div
      className={classNames.outerWrapper}
      data-component="switch"
      data-slot="outer-wrapper"
    >
      <label
        {...mergeProps(labelProps, hoverProps)}
        className={classNames.base}
        data-disabled={disabled ? true : undefined}
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-hover={isHovered || undefined}
        data-invalid={invalid}
        data-pressed={isPressed || undefined}
        data-required={required}
        data-selected={state.isSelected || undefined}
        data-slot="base"
        data-testid={testId}
        htmlFor={ids.control}
      >
        {/* native toggle for keyboard and assistive technology */}
        <VisuallyHidden elementType="span">
          <input
            {...mergeProps(inputProps, focusProps, controlProps)}
            ref={controlRef}
            data-slot="input"
          />
        </VisuallyHidden>

        {/* toggle track and thumb */}
        <SwitchTrack
          className={classNames}
          endContent={endContent}
          selected={state.isSelected}
          startContent={startContent}
          thumbIcon={thumbIcon}
        />
        {label ? (
          <FieldLabel
            as="span"
            className={classNames.label}
            id={ids.label}
            required={required}
          >
            {label}
          </FieldLabel>
        ) : null}
      </label>

      {/* help text and validation messages */}
      {description || invalid ? (
        <div className={classNames.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classNames.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classNames.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SwitchControl;
