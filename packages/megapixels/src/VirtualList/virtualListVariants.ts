import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Styling slots for VirtualList */
export const virtualListVariants = tv({
  slots: {
    /** Root wrapper for the entire component */
    base: 'w-full max-w-2xl',
    /** Rendered item row for loaded data */
    item: 'box-border border-b border-divider bg-content1 p-3 text-foreground',
    /** Positioned list container that owns virtual row placement */
    list: 'relative m-0 list-none p-0',
    /** Footer row for loading/retry actions in infinite mode */
    loadingMoreCell: 'py-3 text-center text-default-500',
    /** Skeleton-like placeholder for unloaded rows in total-count mode */
    placeholderItem: 'box-border border-b border-divider bg-content1 px-3',
    /** Scrollable viewport used as the virtualizer scroll element */
    scrollContainer: 'w-full min-w-80 overflow-x-hidden overflow-y-auto',
    /** Visual frame around the masked scroll area (stays fully opaque) */
    scrollFrame: 'rounded-md border border-divider bg-content1',
    /** Optional styling slot for ScrollShadow wrapper behavior */
    scrollShadow: '',
  },
});

export type VariantProps = TVProps<typeof virtualListVariants>;

export type ClassName = TVClassName<typeof virtualListVariants>;

export type VirtualListClassNames = Record<
  keyof ReturnType<typeof virtualListVariants>,
  string
>;

export default virtualListVariants;
