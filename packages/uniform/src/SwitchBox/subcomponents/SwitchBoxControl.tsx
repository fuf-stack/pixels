import type { Ref } from 'react';
import type { FieldPresentationProps } from '../../partials/types';
import type { SwitchBoxProps } from '../SwitchBox';

import { mergeProps } from 'react-aria/mergeProps';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { useObjectRef } from 'react-aria/useObjectRef';
import { useSwitch } from 'react-aria/useSwitch';
import { VisuallyHidden } from 'react-aria/VisuallyHidden';
import { useToggleState } from 'react-stately/useToggleState';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { switchVariants } from '../../Switch/switchVariants';
import { switchBoxVariants } from '../switchBoxVariants';

interface SwitchBoxControlProps
  extends
    Pick<
      SwitchBoxProps,
      | 'className'
      | 'description'
      | 'disabled'
      | 'label'
      | 'name'
      | 'size'
      | 'thumbIcon'
      | 'icon'
    >,
    FieldPresentationProps<unknown, boolean> {
  /** Ref forwarded to the native switch input */
  inputRef: Ref<HTMLInputElement>;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Selectable switch box with label, description and validation messages
 *
 * @see https://react-aria.adobe.com/useSwitch
 */
const SwitchBoxControl = ({
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
  required,
  size,
  testId,
  thumbIcon,
  value,
  icon,
}: SwitchBoxControlProps) => {
  const controlRef = useObjectRef(inputRef);
  const associations = controlProps;
  const state = useToggleState({
    isSelected: !!value,
    onChange: onValueChange,
  });
  const { inputProps, labelProps, isPressed } = useSwitch(
    {
      ...associations,
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
  const styling = useStyling();
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

  const thumb = (
    <span aria-hidden className={trackClassNames.wrapper} data-slot="wrapper">
      <span className={trackClassNames.thumb} data-slot="thumb">
        {typeof thumbIcon === 'function'
          ? thumbIcon({
              isSelected: state.isSelected,
              className: trackClassNames.thumbIcon,
              width: '1em',
              height: '1em',
              'data-checked': String(state.isSelected),
            })
          : thumbIcon}
      </span>
    </span>
  );

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
        <VisuallyHidden elementType="span">
          <input
            {...mergeProps(inputProps, focusProps, associations)}
            ref={controlRef}
            data-slot="input"
          />
        </VisuallyHidden>
        {!icon ? thumb : null}
        {icon ? <div className={classNames.icon}>{icon}</div> : null}
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
        {icon ? thumb : null}
      </label>
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
