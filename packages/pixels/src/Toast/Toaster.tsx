import type { ComponentProps } from 'react';

import { useEffect, useRef } from 'react';

import { Toaster as SonnerToaster } from 'sonner';

import { cn } from '@fuf-stack/pixel-utils';

export type ToasterProps = Pick<
  ComponentProps<typeof SonnerToaster>,
  'visibleToasts' | 'position' | 'style' | 'className' | 'toastOptions'
>;

const Toaster = ({ toastOptions, ...rest }: ToasterProps) => {
  // mark toasts as a React Aria top layer so modal outside-interaction handling
  // neither blocks toast actions nor dismisses the modal when they are clicked
  // this also keeps toasts accessible to screen readers while a modal is open
  // Sonner forwards the root ref but not arbitrary DOM attributes
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.setAttribute('data-react-aria-top-layer', 'true');
    ref.current?.setAttribute('data-component', 'toaster');
  }, []);

  // Force each toast to take the configured Toaster `--width` so that toasts
  // with short content do not shrink and stay centered when the position is
  // `top-center` / `bottom-center`. Sonner only applies `width: var(--width)`
  // to its built-in styled toasts; our toasts use `toast.custom` and would
  // otherwise size to their content.
  const className = cn('w-[var(--width)]', toastOptions?.className);
  return (
    <SonnerToaster
      ref={ref}
      {...rest}
      toastOptions={{ ...toastOptions, className }}
    />
  );
};

export default Toaster;
