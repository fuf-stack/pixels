/* eslint-disable no-void -- compile-only public API assertions */
import type { ButtonProps } from '@fuf-stack/pixels/Button';
import type { ButtonGroupProps } from '@fuf-stack/pixels/ButtonGroup';

import { createStyling, tv } from '@fuf-stack/pixel-utils';
import { buttonVariants } from '@fuf-stack/pixels/Button';
import { buttonGroupVariants } from '@fuf-stack/pixels/ButtonGroup';

const button: ButtonProps = {
  color: 'info',
  onClick: (event) => {
    const target: Element = event.target;
    void target;
  },
  radius: 'full',
  variant: 'bordered',
};
const group: ButtonGroupProps = {
  fullWidth: true,
  isDisabled: true,
  size: 'sm',
};
const styling = createStyling();
const extended = tv({
  extend: buttonVariants,
  variants: { size: { sm: 'text-xs' } },
});
const className: string = styling.resolve(extended, {
  color: 'info',
  size: 'sm',
});
const groupClassName: string = buttonGroupVariants({ fullWidth: true });
// @ts-expect-error unknown button size
buttonVariants({ size: 'huge' });
// @ts-expect-error unknown group size
const invalid: ButtonGroupProps = { size: 'huge' };
void [button, group, className, groupClassName, invalid];
