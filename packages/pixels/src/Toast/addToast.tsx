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
        base: 'bg-info-50 text-info-600 dark:bg-info-50/50',
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
  /** CSS class name */
  className?: ClassName;
  /** Icon displayed at the end of the Alert */
  closeIcon?: ReactNode;
  /** Color of the alert */
  color?: AddToastVariantProps['color'];
  /** Content displayed inside the Alert */
  description?: ReactNode;
  /** Content displayed at the end of the Alert */
  endContent?: ReactNode;
  /** Icon displayed at the start of the Alert */
  icon?: ReactNode;
  /** Icon or animation displayed until promise is resolved */
  loadingIcon?: ReactNode;
  /** Callback function called when the toast is closed */
  onClose?: () => void;
  /** Promise based on which the notification will be styled */
  promise?: Promise<void>;
  /** Whether the toast should show a progress bar */
  shouldShowTimeoutProgress?: boolean;
  /** Whether the toast should show a close button */
  showCloseButton?: boolean;
  /** Whether the toast should show an icon */
  showIcon?: boolean;
  /** Time the toast is displayed */
  timeout?: number;
  /** Content displayed at the top of the toast */
  title?: ReactNode;
  /** Variant of the toast */
  variant?: AddToastVariantProps['variant'];
}

/**
 * addToast function based on [HeroUI Toast](https://www.heroui.com//docs/components/toast)
 */
export const addToast = ({
  className = undefined,
  closeIcon = undefined,
  color = 'default',
  description = undefined,
  endContent = undefined,
  icon = undefined,
  loadingIcon = undefined,
  onClose = undefined,
  promise = undefined,
  shouldShowTimeoutProgress = false,
  showCloseButton = true,
  showIcon = true,
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
    // TODO: 'data-testid': testId,
    description,
    endContent,
    hideCloseButton: !showCloseButton,
    hideIcon: !showIcon,
    icon,
    loadingIcon,
    onClose,
    promise,
    shouldShowTimeoutProgress,
    timeout,
    title,
    variant,
  });
};

export default addToast;
