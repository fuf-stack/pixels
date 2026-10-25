import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { popoverVariants } from '../Popover/popoverVariants';

/** Tooltip surface, directional arrow and optional content sections */
export const tooltipVariants = tv({
  extend: popoverVariants,
  slots: {
    /** Rounded surface containing the tooltip sections */
    content: 'rounded-medium shadow-small',
    /** Content that opens the tooltip on hover or focus */
    trigger: 'cursor-pointer',
  },
  variants: {
    size: {
      xs: { body: 'max-w-xs', footer: 'max-w-xs', header: 'max-w-xs' },
      sm: { body: 'max-w-sm', footer: 'max-w-sm', header: 'max-w-sm' },
      md: { body: 'max-w-md', footer: 'max-w-md', header: 'max-w-md' },
      lg: { body: 'max-w-lg', footer: 'max-w-lg', header: 'max-w-lg' },
      xl: { body: 'max-w-xl', footer: 'max-w-xl', header: 'max-w-xl' },
      '2xl': { body: 'max-w-2xl', footer: 'max-w-2xl', header: 'max-w-2xl' },
      '3xl': { body: 'max-w-3xl', footer: 'max-w-3xl', header: 'max-w-3xl' },
      full: { base: '' },
    },
  },
});

export type VariantProps = TVProps<typeof tooltipVariants>;

export type ClassName = TVClassName<typeof tooltipVariants>;

export type TooltipClassNames = Record<
  keyof ReturnType<typeof tooltipVariants>,
  string
>;

export default tooltipVariants;
