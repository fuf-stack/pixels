import type { TVProps } from '@fuf-stack/pixel-utils';
import type { ButtonProps as HeroButtonProps } from '@heroui/button';
import type { ReactNode } from 'react';

import { Button as HeroButton } from '@heroui/button';
import { button as heroButtonVariants } from '@heroui/theme';

import { tv } from '@fuf-stack/pixel-utils';

import LoadingSpinner from './subcomponents/LoadingSpinner';

export const buttonVariants = tv({
  extend: heroButtonVariants,
  variants: {
    color: {
      ...heroButtonVariants.variants.color,
      // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/button.ts
      info: '',
    },
    variant: heroButtonVariants.variants.variant,
    size: heroButtonVariants.variants.size,
  },
  compoundVariants: [
    // white text on solid / shadow success button
    {
      color: 'success',
      variant: 'solid',
      class: 'text-white',
    },
    {
      color: 'success',
      variant: 'shadow',
      class: 'text-white',
    },
    // white text on solid / shadow warning button
    {
      color: 'warning',
      variant: 'solid',
      class: 'text-white',
    },
    {
      color: 'warning',
      variant: 'shadow',
      class: 'text-white',
    },
    {
      color: 'info',
      variant: 'solid',
      class: 'bg-info text-info-foreground',
    },
    {
      color: 'info',
      variant: 'shadow',
      class: 'text-info-foreground bg-info shadow-info/40 shadow-lg',
    },
    {
      color: 'info',
      variant: 'bordered',
      class: 'border-medium border-info text-info bg-transparent',
    },
    {
      color: 'info',
      variant: 'flat',
      class: 'bg-info/20 text-info-600',
    },
    {
      color: 'info',
      variant: 'faded',
      class: 'border-default bg-default-100 text-info',
    },
    {
      color: 'info',
      variant: 'light',
      class: 'text-info data-[hover=true]:bg-info-100 bg-transparent',
    },
    {
      color: 'info',
      variant: 'ghost',
      class:
        'border-info text-info data-[hover=true]:!bg-info data-[hover=true]:!text-info-foreground',
    },
  ],
});

type VariantProps = TVProps<typeof buttonVariants>;

export interface ButtonProps extends VariantProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
  /** content of the button */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** color of the button */
  color?: VariantProps['color'];
  /** disables the button */
  disabled?: boolean;
  /** disables all animations */
  disableAnimation?: boolean;
  /** shows loading animation */
  loading?: boolean;
  /** optional icon */
  icon?: ReactNode;
  /** click event handler */
  onClick?: HeroButtonProps['onPress'];
  /** border radius size */
  radius?: VariantProps['radius'];
  /** enable ripple animation effect on click */
  ripple?: boolean;
  /** size options */
  size?: VariantProps['size'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset' | undefined;
  /** visual style variant */
  variant?: VariantProps['variant'];
}

/**
 * Button component based on [HeroUI Button](https://www.heroui.com//docs/components/button)
 */
const Button = ({
  ariaLabel = undefined,
  children = undefined,
  className: _className = undefined,
  color = 'default',
  disableAnimation = false,
  disabled = false,
  icon = undefined,
  loading = false,
  onClick = undefined,
  radius = undefined,
  ripple = false,
  size = undefined,
  testId = undefined,
  type = undefined,
  variant = 'solid',
}: ButtonProps) => {
  const className = buttonVariants({
    className: _className,
    disableAnimation,
    isDisabled: disabled,
    color,
    size,
    variant,
    isIconOnly: !!(icon && !children),
    radius,
  });

  return (
    <HeroButton
      aria-label={ariaLabel}
      className={className}
      data-testid={testId}
      disableRipple={disableAnimation || !ripple}
      isDisabled={disabled}
      isLoading={loading}
      onPress={onClick}
      spinner={<LoadingSpinner />}
      type={type}
    >
      {icon}
      {children}
    </HeroButton>
  );
};

export default Button;
