import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../partials/FieldHelper/fieldHelperVariants';
import { fieldLabelVariants } from '../partials/FieldLabel/fieldLabelVariants';

export const switchVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    /** Container for the field control and supporting text */
    base: 'group relative inline-flex max-w-fit cursor-pointer touch-none items-center justify-start select-none tap-highlight-transparent',
    /** Content at the end of the control */
    endContent: [
      // end icon position and fade transition
      'absolute end-1.5 z-0 text-small text-default-600 opacity-100 transition-transform-opacity',
      // move and hide the selected end icon
      'group-data-[selected=true]:translate-x-3 group-data-[selected=true]:opacity-0',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Visible field label */
    label: [
      fieldLabelVariants.base,
      // beside the control, without the spacing below a stacked label
      'relative ms-2 cursor-pointer pb-0 select-none',
    ],
    /** Container grouping the toggle and field messages */
    outerWrapper: 'place-content-center',
    /** Content at the start of the control */
    startContent: [
      // start icon position and fade transition
      'absolute start-1.5 z-0 scale-50 text-small text-current opacity-0 transition-transform-opacity',
      // reveal the selected start icon
      'group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Movable indicator showing the current value */
    thumb: [
      // thumb layout and surface
      'pointer-events-none z-10 flex h-5 w-5 origin-right items-center justify-center rounded-full bg-white text-small shadow-small transition-all',
      // selected position and pressed width
      'group-data-[pressed=true]:w-6 group-data-[selected=true]:ms-5 group-data-[selected=true]:group-data-[pressed=true]:ms-4',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Content inside the toggle thumb */
    thumbIcon: 'text-black',
    /** Container arranging the selectable content */
    wrapper: [
      // switch track layout and surface
      'relative inline-flex h-7 w-12 shrink-0 items-center justify-start overflow-hidden rounded-full bg-default-200 px-1 transition-background',
      // selected track colors
      'group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground',
      // keyboard focus ring
      'group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background',
      // reduced motion
      'motion-reduce:transition-none',
    ],
  },
  variants: {
    size: {
      lg: {
        endContent: 'text-medium',
        startContent: 'text-medium',
        thumb:
          'h-6 w-6 text-medium group-data-[pressed=true]:w-7 group-data-[selected=true]:ms-6 group-data-[selected=true]:group-data-[pressed=true]:ms-5',
        wrapper: 'h-8 w-14',
      },
      md: {},
      sm: {
        endContent: 'text-tiny',
        startContent: 'text-tiny',
        thumb:
          'h-4 w-4 text-tiny group-data-[pressed=true]:w-5 group-data-[selected=true]:ms-4 group-data-[selected=true]:group-data-[pressed=true]:ms-3',
        wrapper: 'h-6 w-10',
      },
    },
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed',
      },
    },
  },
});

export type VariantProps = TVProps<typeof switchVariants>;

export type ClassName = TVClassName<typeof switchVariants>;
