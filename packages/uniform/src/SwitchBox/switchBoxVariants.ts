import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../partials/FieldHelper/fieldHelperVariants';

export const switchBoxVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    /** Selectable box containing the toggle and text */
    box: [
      // box layout and surface
      'group inline-flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-default',
      // hover and selection feedback
      'hover:bg-content2 data-[selected=true]:border-focus',
    ],
    /** Supporting text for the field */
    // inside the box, without the spacing below a control
    description: 'pt-0 text-foreground opacity-70',
    /** Decorative icon beside the option text */
    icon: '',
    /** Visible field label */
    label: 'font-medium text-foreground',
    /** Movable indicator showing the current value */
    thumb: '',
    /** Content inside the toggle thumb */
    thumbIcon: '',
    /** Container arranging the selectable content */
    wrapper: '',
  },
  variants: {
    disabled: {
      true: {
        box: 'pointer-events-none opacity-disabled',
      },
    },
    invalid: {
      true: {
        box: '!border-danger',
        label: '!text-danger',
      },
    },
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        box: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed hover:bg-transparent',
      },
    },
    size: {
      lg: {
        box: 'gap-4 p-5',
        description: 'text-small',
        label: 'text-base',
      },
      md: {
        box: 'gap-4 p-4',
        description: 'text-small',
        label: 'text-sm',
      },
      sm: {
        box: 'gap-2 p-3',
        description: 'text-xs',
        label: 'text-xs',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ClassName = TVClassName<typeof switchBoxVariants>;
