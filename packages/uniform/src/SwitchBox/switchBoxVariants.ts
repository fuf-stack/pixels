import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const switchBoxVariants = tv({
  slots: {
    /** Selectable box containing the toggle and text */
    box: [
      // box layout and surface
      'group inline-flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-default',
      // hover and selection feedback
      'hover:bg-content2 data-[selected=true]:border-focus',
    ],
    /** Supporting text for the field */
    description: 'text-foreground opacity-70',
    /** Container for validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Container below the switch for validation messages */
    helperWrapper: 'relative ml-0 block p-0',
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
    isDisabled: {
      true: {
        box: 'pointer-events-none opacity-disabled',
      },
    },
    isInvalid: {
      true: {
        box: '!border-danger',
        label: '!text-danger',
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
