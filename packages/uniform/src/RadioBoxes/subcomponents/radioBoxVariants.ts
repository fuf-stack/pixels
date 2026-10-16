import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const radioBoxVariants = tv({
  slots: {
    /** Container for the field control and supporting text */
    base: 'group inline-flex flex-auto cursor-pointer items-center justify-between gap-4 rounded-lg border-2 border-default p-4 hover:bg-content2 data-[selected=true]:border-focus',
    /** Control slot */
    control: '',
    /** Supporting text for the field */
    description: 'text-foreground opacity-70 text-small',
    /** Decorative icon beside the option text */
    icon: '',
    /** Visible field label */
    label: '',
    /** Labelwrapper slot */
    labelWrapper: 'grow',
  },
  variants: {
    isDisabled: {
      true: {
        base: 'pointer-events-none opacity-disabled',
      },
    },
    isInvalid: {
      true: {
        base: '!border-danger',
      },
    },
  },
});

export type ClassName = TVClassName<typeof radioBoxVariants>;
