import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { AlertProps as HeroAlertProps } from '@heroui/alert';
import type { ReactNode } from 'react';

import { Alert as HeroAlert } from '@heroui/alert';
import { alert as heroAlertVariants } from '@heroui/theme';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const alertVariants = tv({
  slots: {
    base: '',
    title: '',
    description: '',
    mainWrapper: '',
    closeButton: '',
    iconWrapper: '',
    alertIcon: '',
  },
  variants: {
    // see:  https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/alert.ts
    color: {
      info: {
        mainWrapper: 'text-inherit',
        title: 'text-inherit',
        description: 'text-inherit',
      },
      ...heroAlertVariants.variants.color,
    },
    variant: {
      ...heroAlertVariants.variants.variant,
    },
    sizeLimit: {
      height: {
        base: 'max-h-[150px] overflow-y-auto overflow-x-hidden',
      },
      width: {
        base: 'max-w-[480px] overflow-x-auto overflow-y-hidden',
      },
      both: {
        base: 'max-h-[150px] max-w-[480px] overflow-y-auto overflow-x-hidden',
      },
    },
  },
  compoundVariants: [
    ...heroAlertVariants.compoundVariants,
    {
      color: 'info',
      variant: 'solid',
      className: {
        base: 'bg-info text-info-foreground',
        alertIcon: 'text-info-foreground',
        closeButton: 'text-inherit',
      },
    },
    {
      color: 'info',
      variant: 'flat',
      className: {
        alertIcon: 'fill-current',
        base: 'dark:bg-info-50/50 bg-info-50 text-info-600',
        closeButton: 'text-info-500 data-[hover]:bg-info-200',
        iconWrapper: 'border-info-100 bg-info-50 dark:bg-info-100',
      },
    },
    {
      color: 'info',
      variant: 'faded',
      className: {
        alertIcon: 'fill-current',
        base: 'dark:bg-info-50/50 border-small border-info-200 bg-info-50 text-info-600 dark:border-info-100',
        closeButton: 'text-info-500 data-[hover]:bg-info-200',
        iconWrapper: 'border-info-100 bg-info-50 dark:bg-info-100',
      },
    },
    {
      color: 'info',
      variant: 'bordered',
      className: {
        alertIcon: 'fill-current',
        base: 'border-small border-info text-info',
        closeButton: 'text-info-500 data-[hover]:bg-info-200',
        iconWrapper: 'bg-info-100 dark:bg-info-50',
      },
    },
  ],
});

export type VariantProps = TVProps<typeof alertVariants>;
type ClassName = TVClassName<typeof alertVariants>;

export interface AlertProps extends VariantProps {
  /** Content displayed inside the Alert if no description is given! */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Color scheme of the Alert */
  color?: VariantProps['color'];
  /** Content displayed at the end of the Alert */
  endContent?: ReactNode;
  /** Icon displayed at the start of the Alert */
  icon?: ReactNode;
  /** Whether the Alert can be closed */
  isClosable?: boolean;
  /** Callback fired when the close button is clicked */
  onClose?: () => void;
  /** Whether to show the icon at the start */
  showIcon?: boolean;
  /** limit height to 150px or width to 480px or both */
  sizeLimit?: VariantProps['sizeLimit'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Title displayed in the Alert above the content */
  title?: ReactNode;
  /** Style variant of the Alert */
  variant?: VariantProps['variant'];
}

/**
 * Alert component based on [HeroUI Alert](https://www.heroui.com//docs/components/alert)
 */
const Alert = ({
  children = undefined,
  className = undefined,
  color = 'primary',
  endContent = undefined,
  icon = undefined,
  isClosable = false,
  onClose = undefined,
  sizeLimit = undefined,
  showIcon = true,
  testId = undefined,
  title = undefined,
  variant = 'solid',
}: AlertProps) => {
  const variants = alertVariants({
    color,
    variant,
    sizeLimit,
  });
  const classNames = variantsToClassNames(variants, className, 'base');

  // pass color prop for heroui colors
  const heroColor = Object.keys(heroAlertVariants.variants.color).includes(
    color,
  )
    ? (color as HeroAlertProps['color'])
    : undefined;

  return (
    <HeroAlert
      classNames={classNames}
      color={heroColor}
      data-testid={testId}
      description={title ? children : undefined}
      endContent={endContent}
      hideIcon={!showIcon}
      icon={icon}
      isClosable={isClosable}
      onClose={onClose}
      title={(title ?? children) as string}
      variant={variant}
    />
  );
};

export default Alert;
