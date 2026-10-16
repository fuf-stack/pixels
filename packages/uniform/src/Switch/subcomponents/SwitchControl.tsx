import type { Ref } from 'react';
import type { FieldPresentationProps } from '../../partials/types';
import type { SwitchProps } from '../Switch';

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
import { switchStateVariants } from '../switchVariants';
import SwitchIcon from './SwitchIcon';
import SwitchThumb from './SwitchThumb';

interface SwitchControlProps
  extends
    Pick<
      SwitchProps,
      | 'className'
      | 'description'
      | 'disabled'
      | 'label'
      | 'name'
      | 'size'
      | 'thumbIcon'
      | 'endContent'
      | 'startContent'
    >,
    FieldPresentationProps<unknown, boolean> {
  /** Ref forwarded to the native switch input */
  inputRef: Ref<HTMLInputElement>;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Switch presentation with native input, focus and thumb content
 *
 * @see https://react-aria.adobe.com/useSwitch
 */
const SwitchControl = ({
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
  endContent,
  startContent,
}: SwitchControlProps) => {
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
  const variants = styling.resolve(switchStateVariants, { size, disabled });
  const classNames = styling.variantsToClassNames(
    variants,
    className,
    'outerWrapper',
  );

  return (
    <div className={classNames.outerWrapper} data-slot="outer-wrapper">
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
        <VisuallyHidden elementType="span">
          <input
            {...mergeProps(inputProps, focusProps, associations)}
            ref={controlRef}
            data-slot="input"
          />
        </VisuallyHidden>
        <span aria-hidden className={classNames.wrapper} data-slot="wrapper">
          {startContent ? (
            <SwitchIcon className={classNames.startContent}>
              {startContent}
            </SwitchIcon>
          ) : null}
          <span className={classNames.thumb} data-slot="thumb">
            <SwitchThumb
              className={classNames.thumbIcon}
              selected={state.isSelected}
              thumbIcon={thumbIcon}
            />
          </span>
          {endContent ? (
            <SwitchIcon className={classNames.endContent}>
              {endContent}
            </SwitchIcon>
          ) : null}
        </span>
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
