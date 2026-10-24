/* eslint-disable no-void -- compile-only public API assertions */
import type { PopoverProps } from '@fuf-stack/pixels/Popover';

import { createStyling } from '@fuf-stack/pixel-utils';
import { popoverVariants } from '@fuf-stack/pixels/Popover';

const props: PopoverProps = {
  className: { body: 'p-4', content: 'rounded-large', trigger: 'text-primary' },
  content: 'Details',
  openControlled: {
    open: false,
    setOpen: (open) => {
      const value: boolean = open;
      void value;
    },
  },
  placement: 'left-end',
  portalContainer: document.createElementNS(
    'http://www.w3.org/1999/xhtml',
    'div',
  ),
  triggerButtonProps: {
    'aria-label': 'Details',
    color: 'success',
    disabled: true,
    variant: 'shadow',
  },
};
const styling = createStyling();
const slots = styling.resolve(popoverVariants);
const content: string = slots.content();
// @ts-expect-error public placements retain hyphenated names
const invalid: PopoverProps = { content: '', placement: 'left end' };
void [props, content, invalid];
