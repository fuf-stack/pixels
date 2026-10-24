/* eslint-disable react/require-default-props -- defaults are defined in the forwarded component */
import type { ReactNode } from 'react';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';
import type { VariantProps } from './buttonVariants';

import { forwardRef, useContext } from 'react';
import { Button as AriaButton } from 'react-aria-components';

import ButtonGroupContext from '../ButtonGroup/ButtonGroupContext';
import { useStyling } from '../StylingProvider';
import { buttonVariants } from './buttonVariants';
import { useButtonRipple } from './hooks/useButtonRipple';
import ButtonRipple from './subcomponents/ButtonRipple';
import LoadingSpinner from './subcomponents/LoadingSpinner';

export { buttonVariants } from './buttonVariants';

export interface ButtonProps extends VariantProps {
  /** Accessible name when the button has no visible text */
  ariaLabel?: string;
  /** Button content */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** Button color */
  color?: VariantProps['color'];
  /** HTML data-slot attribute */
  dataSlot?: string;
  /** Disables transitions and ripple feedback */
  disableAnimation?: boolean;
  /** Disables the button */
  disabled?: boolean;
  /** ID of the form to submit or reset, including forms outside the button's ancestors */
  form?: string;
  /** Icon before the button text */
  icon?: ReactNode;
  /** Shows a spinner and prevents activation */
  loading?: boolean;
  /** Callback when the button loses focus */
  onBlur?: AriaButtonProps['onBlur'];
  /** Callback when activated by pointer, keyboard or assistive technology */
  onClick?: AriaButtonProps['onPress'];
  /** Callback when the button receives focus */
  onFocus?: AriaButtonProps['onFocus'];
  /** Corner radius */
  radius?: VariantProps['radius'];
  /** Enables ripple feedback on activation */
  ripple?: boolean;
  /** Button size */
  size?: VariantProps['size'];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Native button action */
  type?: 'button' | 'submit' | 'reset';
  /** Button appearance */
  variant?: VariantProps['variant'];
}

/** Button for triggering an action or submitting a form */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      ariaLabel,
      children,
      className,
      color = 'default',
      dataSlot,
      disableAnimation = false,
      disabled = false,
      form,
      icon,
      loading = false,
      onBlur,
      onClick,
      onFocus,
      radius,
      ripple = false,
      size,
      testId,
      type,
      variant = 'solid',
    },
    ref,
  ) => {
    const styling = useStyling();
    const group = useContext(ButtonGroupContext);
    const { handleRipplePress, handleRippleComplete, ripples } =
      useButtonRipple(ripple && !disableAnimation);

    // loading prevents activation, the existing icon-only group default hides content
    const isDisabled = disabled || loading;
    const isIconOnly = !!(icon && !children);
    const hideContent = loading && !!group?.isIconOnly;
    const showRipple = ripple && !disableAnimation;

    // className from the button recipe
    const buttonClassName = styling.resolve(buttonVariants, {
      className,
      color,
      disableAnimation,
      isDisabled: disabled,
      isIconOnly,
      radius,
      size,
      variant,
    });

    // preserve inherited edges and width, explicit Pixels defaults keep precedence
    const resolvedClassName = styling.resolve(buttonVariants, {
      color: group?.color ?? 'default',
      disableAnimation: group?.disableAnimation ?? false,
      fullWidth: group?.fullWidth,
      isDisabled,
      isIconOnly: group?.isIconOnly ?? false,
      isInGroup: !!group,
      radius: group?.radius,
      size: group?.size,
      variant: group?.variant ?? 'solid',
      className: buttonClassName,
    });

    // keep the public callback as a React Aria press event
    const handlePress: NonNullable<AriaButtonProps['onPress']> = (event) => {
      onClick?.(event);

      if (showRipple && !isDisabled) {
        handleRipplePress(event);
      }
    };

    return (
      <AriaButton
        ref={ref}
        aria-label={ariaLabel}
        className={resolvedClassName}
        data-loading={loading || undefined}
        data-slot={dataSlot}
        data-testid={testId}
        form={form}
        isDisabled={isDisabled}
        onBlur={onBlur}
        onFocus={onFocus}
        onPress={handlePress}
        render={(props, state) => {
          return (
            <button
              {...props}
              data-focus={state.isFocused || undefined}
              data-hover={state.isHovered || undefined}
              // React Aria supplies the resolved native button type
              // eslint-disable-next-line react/button-has-type
              type={props.type}
            />
          );
        }}
        type={type}
      >
        {loading ? <LoadingSpinner /> : null}
        {hideContent ? null : (
          <>
            {icon}
            {children}
          </>
        )}
        {showRipple
          ? ripples.map((item) => {
              return (
                <ButtonRipple
                  key={item.key}
                  onComplete={handleRippleComplete}
                  ripple={item}
                />
              );
            })
          : null}
      </AriaButton>
    );
  },
);

Button.displayName = 'Button';

export default Button;
