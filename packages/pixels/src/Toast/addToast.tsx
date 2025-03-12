import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ToastProps as HeroToastProps } from '@heroui/toast';
import type { ReactNode } from 'react';

import { toast as heroToastVariants } from '@heroui/theme';
import { addToast as heroAddToast } from '@heroui/toast';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const toastVariants = tv({
  slots: {
    base: '',
    title: '',
    description: '',
    icon: '',
    loadingIcon: '',
    content: '',
    motionDiv: '',
    progressTrack: '',
    progressIndicator: '',
    closeButton: '',
    closeIcon: '',
  },
  variants: {
    // see:  https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/toast.ts
    color: {
      info: {},
      ...heroToastVariants.variants.color,
    },
    variant: {
      ...heroToastVariants.variants.variant,
    },
  },
  compoundVariants: [
    ...heroToastVariants.compoundVariants,
    {
      variant: 'solid',
      color: 'info',
      className: {
        base: 'bg-info text-info-foreground',
        title: 'text-info-foreground',
        description: 'text-info-foreground',
        icon: 'text-info-foreground',
        closeIcon: 'border-info-400 bg-info-100',
        closeButton: 'text-info-400 hover:text-info-600',
        progressIndicator: 'bg-info-400',
      },
    },
    {
      color: 'info',
      variant: 'flat',
      className: {
        base: 'dark:bg-info-50/50 bg-info-50 text-info-600',
        title: 'text-info-600',
        description: 'text-info-500',
        icon: 'text-info-600',
        closeIcon: 'border-info-400 bg-info-100',
        closeButton: 'text-info-400 hover:text-info-600',
        progressIndicator: 'bg-info-400',
      },
    },

    {
      color: 'info',
      variant: 'bordered',
      className: {
        base: 'border-small border-info text-info-600',
        title: 'text-info-600',
        description: 'text-info-500',
        icon: 'text-info-600',
        closeIcon: 'border-info-400 bg-info-100',
        closeButton: 'text-info-400 hover:text-info-600',
        progressIndicator: 'bg-info-400',
      },
    },
  ],
});

export type AddToastVariantProps = TVProps<typeof toastVariants>;
type ClassName = TVClassName<typeof toastVariants>;

export interface ToastProps extends AddToastVariantProps {
  children?: ReactNode;
  className?: ClassName;
  closeIcon?: ReactNode;
  color?: AddToastVariantProps['color'];
  description?: ReactNode;
  endContent?: ReactNode;
  icon?: ReactNode;
  loadingIcon?: ReactNode;
  onClose?: () => void;
  // severity?:
  //   | 'default'
  //   | 'primary'
  //   | 'secondary'
  //   | 'success'
  //   | 'warning'
  //   | 'danger';
  shouldShowTimeoutProgress?: boolean;
  showCloseButton?: boolean;
  showIcon?: boolean;
  // testId?: string;
  timeout?: number;
  title?: ReactNode;
  variant?: AddToastVariantProps['variant'];
}

/**
 * addToast function based on [HeroUI Toast](https://www.heroui.com//docs/components/toast)
 */
export const addToast = ({
  children = undefined,
  className = undefined,
  closeIcon = undefined,
  color = 'default',
  description = undefined,
  endContent = undefined,
  icon = undefined,
  loadingIcon = undefined,
  onClose = undefined,
  // severity = 'default',
  shouldShowTimeoutProgress = false,
  showCloseButton = true,
  showIcon = true,
  // testId = undefined,
  timeout = 5000,
  title = undefined,
  variant = 'bordered',
}: ToastProps) => {
  const variants = toastVariants({
    color,
    variant,
  });
  const isHeroUIColor = Object.keys(heroToastVariants.variants.color).includes(
    color,
  );
  const classNames = variantsToClassNames(variants, className, 'base');
  heroAddToast({
    classNames,
    closeIcon,
    color: isHeroUIColor ? (color as HeroToastProps['color']) : undefined,
    // 'data-testid': testId,
    // https://github.com/heroui-inc/heroui/issues/5033
    // @ts-expect-error bug in hero-toast: description should be ReactNode
    description: description || title ? children : undefined,
    endContent,
    hideCloseButton: !showCloseButton,
    hideIcon: !showIcon,
    icon,
    loadingIcon,
    onClose,
    // severity={severity}
    shouldShowTimeoutProgress,
    timeout,
    title: (title || children) as string,
    variant,
  });
};

export default addToast;
