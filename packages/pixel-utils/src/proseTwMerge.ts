import type { ConfigExtension } from 'tailwind-merge';

import { extendTailwindMerge, validators } from 'tailwind-merge';

type ProseClassGroupIds = 'prose-size' | 'prose-color';

/**
 * Typography plugin size classes are standalone tokens like `prose-sm`
 * instead of regular utilities, so we register them as a custom merge group.
 */
const isProseSize = (value: string): boolean => {
  return value === 'base' || validators.isTshirtSize(value);
};

/**
 * Typography plugin color themes are also standalone `prose-*` classes.
 * Keep `prose-invert` out of this group so it can coexist with a color class.
 */
const isProseColor = (value: string): boolean => {
  return (
    value !== 'invert' &&
    !isProseSize(value) &&
    (validators.isAnyNonArbitrary(value) || validators.isArbitraryValue(value))
  );
};

export const proseTwMergeClassGroups: NonNullable<
  NonNullable<
    ConfigExtension<ProseClassGroupIds, never>['extend']
  >['classGroups']
> = {
  // Typography plugin sizes are mutually exclusive standalone classes.
  'prose-size': [{ prose: [isProseSize] }],
  // Typography plugin color themes are also mutually exclusive standalone classes.
  'prose-color': [{ prose: [isProseColor] }],
};

/**
 * Prose-aware `tailwind-merge` instance that deduplicates `prose-*` classes.
 * Used by `cn(...)` internally. Also exported for direct use in components
 * that need prose-aware class merging outside of `cn`.
 */
export const proseTwMerge = extendTailwindMerge<ProseClassGroupIds>({
  extend: {
    classGroups: proseTwMergeClassGroups,
  },
});
