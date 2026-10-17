import type { TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Inline arrangement of related buttons */
export const buttonGroupVariants = tv({
  base: 'inline-flex h-auto items-center justify-center',
  variants: { fullWidth: { true: 'w-full' } },
  defaultVariants: { fullWidth: false },
});

export type VariantProps = TVProps<typeof buttonGroupVariants>;

export default buttonGroupVariants;
