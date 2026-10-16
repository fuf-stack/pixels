import type { UniformField } from '../../hooks/useUniformField/types';
import type { SwitchBoxProps } from '../SwitchBox';

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
import { switchVariants } from '../../Switch/switchVariants';
import { switchBoxVariants } from '../switchBoxVariants';
import SwitchBoxTrack from './SwitchBoxTrack';

interface SwitchBoxControlProps extends Pick<
  SwitchBoxProps,
  'className' | 'icon' | 'size' | 'thumbIcon'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, boolean>;
}

/**
 * Selectable switch box with label, description and validation messages
 *
 * @see https://react-aria.adobe.com/useSwitch
 */
const SwitchBoxControl = ({
  field,
  className,
  size,
  thumbIcon,
  icon,
}: SwitchBoxControlProps) => {
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
      name,
      children: label,
      isDisabled: disabled,
      isInvalid: invalid,
      isRequired: required,
      validationBehavior: 'aria',
      onBlur,
    },
    state,
    controlRef,
  );
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // classNames from slots
  const variants = styling.resolve(switchBoxVariants, {
    isDisabled: disabled,
    isInvalid: invalid,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'box');

  const trackVariants = styling.resolve(switchVariants, { size });
  const trackClassNames = styling.variantsToClassNames(trackVariants, {
    wrapper: classNames.wrapper,
    thumb: classNames.thumb,
    thumbIcon: classNames.thumbIcon,
  });

  return (
    <>
      <label
        {...mergeProps(labelProps, hoverProps)}
        className={classNames.box}
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-hover={isHovered || undefined}
        data-invalid={invalid}
        data-pressed={isPressed || undefined}
        data-required={required}
        data-selected={state.isSelected || undefined}
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
        {!icon ? (
          <SwitchBoxTrack
            className={trackClassNames}
            selected={state.isSelected}
            thumbIcon={thumbIcon}
          />
        ) : null}
        {icon ? <div className={classNames.icon}>{icon}</div> : null}

        {/* label and supporting text */}
        <div className="grow">
          {label ? (
            <FieldLabel
              as="div"
              className={classNames.label}
              id={ids.label}
              required={required}
            >
              {label}
            </FieldLabel>
          ) : null}
          {description ? (
            <FieldDescription
              className={classNames.description}
              data-slot={undefined}
              id={ids.description}
            >
              {description}
            </FieldDescription>
          ) : null}
        </div>
        {icon ? (
          <SwitchBoxTrack
            className={trackClassNames}
            selected={state.isSelected}
            thumbIcon={thumbIcon}
          />
        ) : null}
      </label>

      {/* validation messages below the box */}
      {invalid ? (
        <div className={classNames.helperWrapper} data-slot="helper-wrapper">
          <div
            className={classNames.errorMessage}
            data-slot="error-message"
            id={ids.error}
          >
            {errorMessage}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SwitchBoxControl;
