/* eslint-disable react/require-default-props -- defaults are defined in the forwarded component */
import type { ElementType, HTMLAttributes } from 'react';
import type { VariantProps as ButtonVariantProps } from '../Button/buttonVariants';
import type { VariantProps } from './buttonGroupVariants';

import { forwardRef, useMemo } from 'react';

import { useStyling } from '../StylingProvider';
import ButtonGroupContext from './ButtonGroupContext';
import { buttonGroupVariants } from './buttonGroupVariants';

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps {
  /** Element or component used for the group */
  as?: ElementType;
  /** CSS class name */
  className?: string;
  /** Default button color */
  color?: ButtonVariantProps['color'];
  /** Disables button animations */
  disableAnimation?: boolean;
  /** Disables button ripple effects */
  disableRipple?: boolean;
  /** Expands the group and its buttons to fill the available width */
  fullWidth?: boolean;
  /** Default disabled state for buttons */
  isDisabled?: boolean;
  /** Default icon-only layout for buttons */
  isIconOnly?: boolean;
  /** Default button corner radius */
  radius?: ButtonVariantProps['radius'];
  /** Default button size */
  size?: ButtonVariantProps['size'];
  /** Default button appearance */
  variant?: ButtonVariantProps['variant'];
}

/** Connected group of related actions */
const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      as: Base = 'div',
      children,
      className,
      color = 'default',
      disableAnimation = false,
      disableRipple = false,
      fullWidth = false,
      isDisabled = false,
      isIconOnly = false,
      radius,
      size = 'md',
      variant = 'solid',
      ...props
    },
    ref,
  ) => {
    const styling = useStyling();
    const context = useMemo(() => {
      return {
        color,
        disableAnimation,
        disableRipple,
        fullWidth,
        isDisabled,
        isIconOnly,
        radius,
        size,
        variant,
      };
    }, [
      color,
      disableAnimation,
      disableRipple,
      fullWidth,
      isDisabled,
      isIconOnly,
      radius,
      size,
      variant,
    ]);

    // className from the group recipe
    const groupClassName = styling.resolve(buttonGroupVariants, {
      fullWidth,
      className,
    });

    return (
      <ButtonGroupContext.Provider value={context}>
        <Base
          role="group"
          {...props}
          ref={ref}
          className={groupClassName}
          data-component="button-group"
        >
          {children}
        </Base>
      </ButtonGroupContext.Provider>
    );
  },
);

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
