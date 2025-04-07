import type { ToastProps as HeroToastProps } from '@heroui/toast';
import type { ToastProps } from './addToast';

import { toast as heroToastVariants } from '@heroui/theme';
import { ToastProvider as HeroToastProvider } from '@heroui/toast';

import { variantsToClassNames } from '@fuf-stack/pixel-utils';

import { toastVariants } from './addToast';

export type ToastProviderToastProps = Omit<
  ToastProps,
  'description' | 'endContent' | 'title'
>;

export interface ToastProviderProps {
  disableAnimation?: boolean;
  maxVisibleToasts?: number;
  placement?:
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left'
    | 'top-center';

  toastProps?: ToastProviderToastProps;
  toastOffset?: number;
  regionProps?: { classNames?: Record<'base', string> };
}

/**
 * ToastProvider component based on [HeroUI Toast](https://www.heroui.com//docs/components/toast)
 */
const ToastProvider = ({
  disableAnimation = false,
  maxVisibleToasts = 5,
  placement = 'top-center',
  toastProps = undefined,
  toastOffset = 26,
  regionProps = undefined,
}: ToastProviderProps) => {
  const variants = toastVariants({
    color: toastProps?.color,
    variant: toastProps?.variant,
  });
  const isHeroUIColor = Object.keys(heroToastVariants.variants.color).includes(
    toastProps?.color || '',
  );
  const classNames = variantsToClassNames(
    variants,
    toastProps?.className,
    'base',
  );
  return (
    <HeroToastProvider
      disableAnimation={disableAnimation}
      maxVisibleToasts={maxVisibleToasts}
      placement={placement}
      regionProps={regionProps}
      toastOffset={toastOffset}
      toastProps={{
        ...toastProps,
        classNames,
        color: isHeroUIColor
          ? (toastProps?.color as HeroToastProps['color'])
          : undefined,
      }}
    />
  );
};

export default ToastProvider;
