import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Overlapping avatar row and overflow count */
export const avatarGroupVariants = tv({
  slots: {
    /** Row arranging avatars and optional wrappers */
    base: [
      'flex h-auto w-max items-center justify-center',
      // position wrappers and direct avatars in the same overlapping row
      '[&>:first-child]:ms-0 [&>:not(:first-child)]:-ms-2',
      // the trailing item has no neighbor to uncover on hover
      '[&>:last-child]:hover:-translate-x-0',
    ],
    /** Overflow count after the visible avatars */
    count: 'hover:-translate-x-0',
  },
});

export type VariantProps = TVProps<typeof avatarGroupVariants>;

export type ClassName = TVClassName<typeof avatarGroupVariants>;

export default avatarGroupVariants;
