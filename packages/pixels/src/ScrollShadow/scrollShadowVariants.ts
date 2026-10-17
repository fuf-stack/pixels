import type { TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Scrollable surface with fading edges for hidden content */
export const scrollShadowVariants = tv({
  variants: {
    hideScrollBar: {
      true: '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    },
    orientation: {
      horizontal: [
        'overflow-x-auto',
        // fade the leading, trailing or both horizontal edges
        'data-[left-scroll=true]:[mask-image:linear-gradient(270deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
        'data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
        'data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
      ],
      vertical: [
        'overflow-y-auto',
        // fade the leading, trailing or both vertical edges
        'data-[top-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
        'data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
        'data-[top-bottom-scroll=true]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]',
      ],
    },
  },
  defaultVariants: { hideScrollBar: false, orientation: 'vertical' },
});

export type VariantProps = TVProps<typeof scrollShadowVariants>;

export default scrollShadowVariants;
