import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const fieldCardVariants = tv({
  slots: {
    /** base class for the field card wrapper */
    base: [
      // base styles
      'overflow-hidden rounded-small border bg-content1',
      // animate border color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
    ],
    /** class for the content */
    content: [
      // same as p-3 of Card component
      'p-3',
      // default grid for form components (see Grid component)
      'grid gap-4',
    ],
    /** class for the error footer wrapper */
    errorFooter: [
      'border-t',
      // force helper to be visible and add padding (pt-1 to compensate for inner content's top padding)
      'block px-3 pb-2 pt-1',
      // animate border color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
    ],
    /** class for the error text (empty base, color controlled by variant) */
    errorText: [],
    /** class for the label/header */
    label: [
      // keep the label in normal flow at full width
      'pointer-events-auto! static! z-auto! block! w-full!',
      // reset any transforms or translations
      'translate-x-0! translate-y-0! transform-none!',
      // card header styling - use text-medium (16px) for proper header size
      'rounded-t-small border-b p-3 font-semibold text-medium',
      // animate border and text color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
    ],
  },
  variants: {
    invalid: {
      false: {
        base: 'border-divider',
        errorFooter: 'border-divider',
        errorText: '!text-foreground-500 text-tiny',
        label: 'border-divider text-foreground',
      },
      true: {
        base: 'border-danger-200',
        errorFooter: 'border-danger-200',
        errorText: '!text-danger text-tiny',
        label: 'border-danger-200 text-danger',
      },
    },
  },
  defaultVariants: {
    invalid: false,
  },
});

export type ClassName = TVClassName<typeof fieldCardVariants>;
