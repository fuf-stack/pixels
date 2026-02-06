import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { AlertProps as HeroAlertProps } from '@heroui/alert';
import type { ReactNode } from 'react';

import { Alert as HeroAlert } from '@heroui/alert';
import { alert as heroAlertVariants } from '@heroui/theme';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const alertVariants = tv({
  slots: {
    base: 'min-w-72',
    title: '',
    description: '',
    mainWrapper: 'gap-1.5',
    closeButton: '',
    iconWrapper: '',
    alertIcon: '',
  },
  variants: {
    // if HeroUI Alert title and description are set the icon is placed on top (looks better)
    hasTitleAndChildren: {
      true: {
        iconWrapper: 'self-start',
      },
    },
    // see:  https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/alert.ts
    color: {
      info: {
        mainWrapper: 'text-inherit',
        title: 'text-inherit',
        description: 'text-inherit',
      },
      ...heroAlertVariants.variants.color,
    },
    // only 2 variants: solid and bordered (bordered uses HeroUI's faded variant)
    variant: {
      bordered: heroAlertVariants.variants.variant.faded,
      solid: heroAlertVariants.variants.variant.solid,
    },
  },
  compoundVariants: [
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
      variant: 'bordered',
      className: {
        alertIcon: 'fill-current',
        base: 'dark:bg-info-50/50 border-small border-info-200 bg-info-50 text-info-600 dark:border-info-100',
        closeButton: 'text-info-500 data-[hover]:bg-info-200',
        iconWrapper: 'border-info-100 bg-info-50 dark:bg-info-100',
      },
    },
  ],
});

export type VariantProps = TVProps<typeof alertVariants>;
type ClassName = TVClassName<typeof alertVariants>;

// hasTitleAndChildren is omitted because its used for automatic icon position
export interface AlertProps extends Omit<VariantProps, 'hasTitleAndChildren'> {
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
  closable?: boolean;
  /** Callback fired when the close button is clicked */
  onClose?: () => void;
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
  closable = false,
  onClose = undefined,
  showIcon = true,
  testId = undefined,
  title = undefined,
  variant = 'bordered',
}: AlertProps) => {
  const hasTitleAndChildren = !!children && !!title;
  const variants = alertVariants({
    hasTitleAndChildren,
    color,
    variant,
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
      // map closable to isClosable, because of we do not want "is" as prefix
      isClosable={closable}
      onClose={onClose}
      title={(title ?? children) as string}
      variant={variant}
    />
  );
};

export default Alert;
