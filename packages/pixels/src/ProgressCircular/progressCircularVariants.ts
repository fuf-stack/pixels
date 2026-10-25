import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Circular progress track, value and completion or error feedback */
export const progressCircularVariants = tv({
  slots: {
    /** Container centering the progress ring */
    base: 'flex max-w-fit flex-col items-center justify-center gap-1',
    /** Filled arc showing completed progress */
    indicator: [
      'h-full stroke-current',
      // animate updates while respecting reduced motion
      'transition-all !duration-500 motion-reduce:transition-none',
    ],
    /** Reserved supporting label slot */
    label: 'text-small',
    /** Completion or error symbol inside the ring */
    statusIcon: '',
    /** Drawing surface for the progress ring */
    svg: 'relative z-0 overflow-hidden',
    /** Container positioning the value inside the ring */
    svgWrapper: 'relative block',
    /** Unfilled arc behind the progress indicator */
    track: 'h-full stroke-default-300',
    /** Formatted value centered inside the ring */
    value: 'absolute inset-0 flex items-center justify-center font-normal',
  },
  variants: {
    color: {
      info: { svg: 'text-info' },
      default: { svg: 'text-default-400' },
      primary: { svg: 'text-primary' },
      secondary: { svg: 'text-secondary' },
      success: { svg: 'text-success' },
      warning: { svg: 'text-warning' },
      danger: { svg: 'text-danger' },
    },
    disableAnimation: {
      true: { indicator: '!transition-none' },
    },
    hasError: {
      true: { statusIcon: 'text-danger', svg: 'text-danger' },
    },
    isFinished: {
      true: { statusIcon: 'text-success', svg: 'text-success' },
    },
    size: {
      xs: { svg: 'h-10 w-10', value: 'text-[0.6rem]' },
      sm: { svg: 'h-12 w-12', value: 'text-xs' },
      md: { svg: 'h-16 w-16', value: 'text-md' },
      lg: { svg: 'h-20 w-20', value: 'text-lg' },
      xl: { svg: 'h-24 w-24', value: 'text-xl' },
    },
  },
  defaultVariants: { color: 'info', size: 'md' },
});

export type VariantProps = TVProps<typeof progressCircularVariants>;

export type ClassName = TVClassName<typeof progressCircularVariants>;

export type ProgressCircularClassNames = Record<
  keyof typeof progressCircularVariants.slots,
  string
>;

export default progressCircularVariants;
