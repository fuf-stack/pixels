import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import radioControlVariants from '../../Radios/subcomponents/radioControlVariants';

export const radioBoxVariants = tv({
  slots: {
    /** Container for the field control and supporting text */
    base: [
      // option box layout
      'group inline-flex flex-auto cursor-pointer items-center justify-between gap-4',
      // box border and padding
      'rounded-lg border-2 border-default p-4',
      // hover and selection feedback
      'hover:bg-content2 data-[selected=true]:border-focus',
    ],
    /** Dot marking the selected option */
    control: radioControlVariants.slots.control,
    /** Supporting text for the field */
    description: 'text-foreground opacity-70 text-small',
    /** Option state boundary without an additional layout box */
    field: radioControlVariants.slots.field,
    /** Decorative icon beside the option text */
    icon: '',
    /** Visible field label */
    label: radioControlVariants.slots.label,
    /** Container grouping the option label and description */
    labelWrapper: [radioControlVariants.slots.labelWrapper, 'grow'],
    /** Circular outline around the selection indicator */
    wrapper: radioControlVariants.slots.wrapper,
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
        control: radioControlVariants.variants.invalid.true.control,
        label: radioControlVariants.variants.invalid.true.label,
        wrapper: radioControlVariants.variants.invalid.true.wrapper,
      },
    },
  },
});

export type ClassName = TVClassName<typeof radioBoxVariants>;
