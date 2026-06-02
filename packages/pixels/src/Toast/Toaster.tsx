import type { ComponentProps } from 'react';

import { Toaster as SonnerToaster } from 'sonner';

import { cn } from '@fuf-stack/pixel-utils';

export type ToasterProps = Pick<
  ComponentProps<typeof SonnerToaster>,
  'visibleToasts' | 'position' | 'style' | 'className' | 'toastOptions'
>;

const Toaster = ({ toastOptions, ...rest }: ToasterProps) => {
  // Force each toast to take the configured Toaster `--width` so that toasts
  // with short content do not shrink and stay centered when the position is
  // `top-center` / `bottom-center`. Sonner only applies `width: var(--width)`
  // to its built-in styled toasts; our toasts use `toast.custom` and would
  // otherwise size to their content.
  const className = cn('w-[var(--width)]', toastOptions?.className);
  return (
    <SonnerToaster {...rest} toastOptions={{ ...toastOptions, className }} />
  );
};

export default Toaster;
