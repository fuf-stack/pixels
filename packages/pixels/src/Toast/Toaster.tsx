import type { ComponentProps } from 'react';

import { useEffect, useRef } from 'react';

import { Toaster as SonnerToaster } from 'sonner';

import { cn } from '@fuf-stack/pixel-utils';

export type ToasterProps = Pick<
  ComponentProps<typeof SonnerToaster>,
  'visibleToasts' | 'position' | 'style' | 'className' | 'toastOptions'
>;

const Toaster = ({ toastOptions, ...rest }: ToasterProps) => {
  // Mark the toaster as a react-aria "top layer" so it stacks above modals
  // correctly. react-aria treats toasts as a special case: with this attribute
  // present on an ancestor, an open HeroUI/react-aria modal (1) no longer
  // swallows pointer/click events on the toaster as "interact outside" — which
  // otherwise blocks clicks on toast action buttons and could dismiss the
  // modal — and (2) keeps the toaster visible to screen readers instead of
  // `aria-hidden`-ing it. See `useInteractOutside` / `ariaHideOutside` in
  // @react-aria, which both special-case `[data-react-aria-top-layer]`. HeroUI
  // does not forward `shouldCloseOnInteractOutside` (see heroui-inc/heroui#3635),
  // so this attribute is the only way to opt out. Sonner forwards the `ref` to
  // its root <section>, but does not accept arbitrary DOM attributes, so we set
  // it imperatively.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.setAttribute('data-react-aria-top-layer', 'true');
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
