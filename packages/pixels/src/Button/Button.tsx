import type { TVProps } from '@fuf-stack/pixel-utils';
import type { ButtonProps as HeroButtonProps } from '@heroui/button';
import type { ReactNode } from 'react';

import { Button as HeroButton } from '@heroui/button';

import { tv } from '@fuf-stack/pixel-utils';

import LoadingSpinner from './subcomponents/LoadingSpinner';

export const buttonVariants = tv({
  base: '',
  variants: {
    color: {
      default: '',
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
    },
    variant: {
      solid: '',
      bordered: '',
      light: '',
      flat: '',
      faded: '',
      shadow: '',
      ghost: '',
    },
  },
  compoundVariants: [
    // white text on solid / shadow success button
    {
      color: 'success',
      variant: ['solid', 'shadow'],
      class: 'text-white',
    },
    // white text on solid / shadow warning button
    {
      color: 'warning',
      variant: ['solid', 'shadow'],
      class: 'text-white',
    },
  ],
});

type VariantProps = TVProps<typeof buttonVariants>;

export interface ButtonProps extends VariantProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** hero ui button color  */
  color?: HeroButtonProps['color'];
  /** disables function of the button. */
  disabled?: boolean;
  /** disables all button animations */
  disableAnimation?: boolean;
  /** If set loading animation is shown */
  loading?: boolean;
  /** optional icon */
  icon?: ReactNode;
  /** on click event */
  onClick?: HeroButtonProps['onPress'];
  /** 3 size options */
  size?: HeroButtonProps['size'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** sets the button type. */
  type?: 'button' | 'submit' | 'reset' | undefined;
  /** hero ui button variants */
  variant?: HeroButtonProps['variant'];
}

/**
 * Button component based on [HeroUI Button](https://www.heroui.com//docs/components/button)
 */
const Button = ({
  ariaLabel = undefined,
  children = undefined,
  className = undefined,
  color = 'default',
  disabled = false,
  disableAnimation = false,
  icon = undefined,
  loading = false,
  onClick = undefined,
  size = undefined,
  testId = undefined,
  type = undefined,
  variant = 'solid',
}: ButtonProps) => {
  return (
    <HeroButton
      aria-label={ariaLabel}
      className={buttonVariants({ color, variant, className })}
      color={color}
      data-testid={testId}
      disableAnimation={disableAnimation}
      disableRipple={disableAnimation}
      isDisabled={disabled}
      isIconOnly={!!(icon && !children)}
      isLoading={loading}
      onPress={onClick}
      size={size}
      spinner={<LoadingSpinner />}
      type={type}
      variant={variant}
    >
      {icon}
      {children}
    </HeroButton>
  );
};

export default Button;
