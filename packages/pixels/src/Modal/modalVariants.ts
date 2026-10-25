import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Dialog surface, backdrop, content sections and close control */
export const modalVariants = tv({
  slots: {
    /** Dimmed surface behind the dialog */
    backdrop: [
      // cover the viewport
      'fixed inset-0 z-50 h-screen w-screen',
      // dim the page behind the dialog
      'bg-overlay/50 backdrop-opacity-disabled',
    ],
    /** Rounded dialog containing the content sections */
    base: [
      'relative z-50 box-border flex w-full flex-col',
      // surface and viewport spacing
      'mx-1 my-1 rounded-large bg-content1 shadow-small sm:mx-6 sm:my-16',
      'outline-solid max-h-[calc(100%_-_8rem)] outline-transparent',
    ],
    /** Scrollable body between the heading and footer */
    body: 'flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4',
    /** Button dismissing the dialog */
    closeButton: [
      // position and hit area
      'absolute end-1 top-1 select-none appearance-none rounded-full p-2',
      // pointer feedback
      'text-foreground-500 tap-highlight-transparent hover:bg-default-100 active:bg-default-200',
      // keyboard focus ring
      'outline-solid outline-transparent',
      'data-[focus-visible]:z-10 data-[focus-visible]:outline-2',
      'data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus',
    ],
    /** Actions below the dialog body */
    footer:
      'flex flex-row justify-end gap-2 border-t border-t-divider px-6 py-4',
    /** Title above the dialog body */
    header:
      'flex flex-initial border-b border-b-divider px-6 py-4 font-semibold text-large',
    /** Viewport container centering the dialog */
    wrapper: [
      // use the visible viewport when a mobile keyboard is open
      'h-(--visual-viewport-height) fixed inset-0 z-50 w-screen overflow-x-auto',
      // center the dialog surface
      'flex items-center justify-center',
    ],
  },
  variants: {
    size: {
      sm: { base: 'max-w-sm' },
      md: { base: 'max-w-md' },
      lg: { base: 'max-w-lg' },
      xl: { base: 'max-w-5xl' },
      full: { base: 'h-[80dvh] max-w-full' },
    },
  },
});

export type VariantProps = TVProps<typeof modalVariants>;

export type ClassName = TVClassName<typeof modalVariants>;

export type ModalClassNames = Record<
  keyof ReturnType<typeof modalVariants>,
  string
>;

export default modalVariants;
