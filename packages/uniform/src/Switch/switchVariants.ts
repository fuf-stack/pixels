import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const switchVariants = tv({
  slots: {
    /** Container for the field control and supporting text */
    base: 'group relative inline-flex max-w-fit cursor-pointer touch-none select-none items-center justify-start tap-highlight-transparent',
    /** Supporting text for the field */
    description: 'text-foreground-500 text-tiny',
    /** Content at the end of the control */
    endContent: [
      // end icon position and fade transition
      'absolute end-1.5 z-0 text-default-600 opacity-100 transition-transform-opacity text-small',
      // move and hide the selected end icon
      'group-data-[selected=true]:translate-x-3 group-data-[selected=true]:opacity-0',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Container for validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Container for help text and validation messages */
    helperWrapper: 'relative ml-0 block p-0',
    /** Visible field label */
    label:
      'group-data-[invalid=true]:text-danger! relative ms-2 select-none text-sm text-foreground subpixel-antialiased',
    /** Container grouping the toggle and field messages */
    outerWrapper: 'place-content-center',
    /** Content at the start of the control */
    startContent: [
      // start icon position and fade transition
      'absolute start-1.5 z-0 scale-50 text-current opacity-0 transition-transform-opacity text-small',
      // reveal the selected start icon
      'group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Movable indicator showing the current value */
    thumb: [
      // thumb layout and surface
      'pointer-events-none z-10 flex h-5 w-5 origin-right items-center justify-center rounded-full bg-white shadow-small transition-all text-small',
      // selected position and pressed width
      'group-data-[selected=true]:group-data-[pressed=true]:ms-4 group-data-[selected=true]:ms-5 group-data-[pressed=true]:w-6',
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
          'h-6 w-6 text-medium group-data-[selected=true]:group-data-[pressed=true]:ms-5 group-data-[selected=true]:ms-6 group-data-[pressed=true]:w-7',
        wrapper: 'h-8 w-14',
      },
      md: {},
      sm: {
        endContent: 'text-tiny',
        startContent: 'text-tiny',
        thumb:
          'h-4 w-4 text-tiny group-data-[selected=true]:group-data-[pressed=true]:ms-3 group-data-[selected=true]:ms-4 group-data-[pressed=true]:w-5',
        wrapper: 'h-6 w-10',
      },
    },
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
  },
});

export type VariantProps = TVProps<typeof switchVariants>;

export type ClassName = TVClassName<typeof switchVariants>;
