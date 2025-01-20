import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { AlertProps as NextAlertProps } from '@heroui/alert';
import type { ReactNode } from 'react';

import { Alert as NextAlert } from '@heroui/alert';
import { alert as nextAlertVariants } from '@heroui/theme';

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
    // See: https://github.comnextui-orgnextui/blob/canary/packages/core/theme/src/components/alert.ts
    color: {
      info: {
        mainWrapper: 'text-inherit',
        title: 'text-inherit',
        description: 'text-inherit',
      },
      ...nextAlertVariants.variants.color,
    },
    variant: {
      ...nextAlertVariants.variants.variant,
    },
  },
  compoundVariants: [
    ...nextAlertVariants.compoundVariants,
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
  onClose?: () => void | undefined;
  /** Whether to show the icon at the start */
  showIcon?: boolean;
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
  showIcon = true,
  testId = undefined,
  title = undefined,
  variant = 'solid',
}: AlertProps) => {
  const variants = alertVariants({
    color,
    variant,
  });
  const isHeroUIColor = Object.keys(nextAlertVariants.variants.color).includes(
    color,
  );
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <NextAlert
      classNames={classNames}
      color={isHeroUIColor ? (color as NextAlertProps['color']) : undefined}
      data-testid={testId}
      description={title ? children : undefined}
      endContent={endContent}
      hideIcon={!showIcon}
      icon={icon}
      isClosable={isClosable}
      onClose={onClose}
      title={(title || children) as string}
      variant={variant}
    />
  );
};

export default Alert;
