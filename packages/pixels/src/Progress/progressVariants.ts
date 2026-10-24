import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Progress track, filled indicator and optional labels */
export const progressVariants = tv({
  slots: {
    /** Container for the labels and progress track */
    base: 'flex w-full flex-col gap-2',
    /** Filled portion of the progress track */
    indicator: [
      'h-full rounded-full',
      // animate value changes without animating the initial value
      'transition-transform !duration-500 motion-reduce:transition-none',
    ],
    /** Description above the progress track */
    label: '',
    /** Row containing the description and progress value */
    labelWrapper: 'flex justify-between',
    /** Unfilled background behind the progress indicator */
    track: [
      'relative z-0 overflow-hidden rounded-full',
      'bg-default-300/50 rtl:rotate-180',
    ],
    /** Formatted progress value above the track */
    value: '',
  },
  variants: {
    color: {
      danger: { indicator: 'bg-danger' },
      default: { indicator: 'bg-default-400' },
      info: { indicator: 'bg-info' },
      primary: { indicator: 'bg-primary' },
      secondary: { indicator: 'bg-secondary' },
      success: { indicator: 'bg-success' },
      warning: { indicator: 'bg-warning' },
    },
    disableAnimation: {
      true: { indicator: '!transition-none' },
    },
    indeterminate: {
      true: { indicator: 'absolute w-full origin-left' },
    },
    size: {
      sm: { label: 'text-small', track: 'h-1', value: 'text-small' },
      md: { label: 'text-medium', track: 'h-3', value: 'text-medium' },
      lg: { label: 'text-large', track: 'h-5', value: 'text-large' },
    },
  },
  defaultVariants: { color: 'info', size: 'md' },
});

export type VariantProps = TVProps<typeof progressVariants>;

export type ClassName = TVClassName<typeof progressVariants>;

export default progressVariants;
