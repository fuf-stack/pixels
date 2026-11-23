import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Corner badge surface, outline and content sizing */
export const badgeVariants = tv({
  slots: {
    /** Badge content positioned over the wrapped element */
    badge: [
      // centered content inside the floating pill
      'font-regular absolute z-10 box-border flex origin-center flex-wrap place-content-center items-center rounded-full whitespace-nowrap subpixel-antialiased select-none',
      // retain appearance changes without animating reduced-motion users
      'scale-100 opacity-100 transition-transform-opacity !duration-300 !ease-soft-spring motion-reduce:transition-none',
    ],
    /** Positioning container around the wrapped element */
    base: 'relative inline-flex shrink-0',
  },
  variants: {
    color: {
      default: { badge: 'bg-default text-default-foreground' },
      primary: { badge: 'bg-primary text-primary-foreground' },
      secondary: { badge: 'bg-secondary text-secondary-foreground' },
      success: { badge: 'bg-success text-success-foreground' },
      warning: { badge: 'bg-warning text-warning-foreground' },
      danger: { badge: 'bg-danger text-danger-foreground' },
    },
    isDot: { true: {} },
    isOneChar: { true: {} },
    noOutline: {
      true: { badge: 'border-0 border-transparent' },
      false: { badge: 'border-2 border-background' },
    },
    placement: {
      'top-right': {
        badge: 'top-[5%] right-[5%] translate-x-1/2 -translate-y-1/2',
      },
      'top-left': {
        badge: 'top-[5%] left-[5%] -translate-x-1/2 -translate-y-1/2',
      },
      'bottom-right': {
        badge: 'right-[5%] bottom-[5%] translate-x-1/2 translate-y-1/2',
      },
      'bottom-left': {
        badge: 'bottom-[5%] left-[5%] -translate-x-1/2 translate-y-1/2',
      },
    },
    size: {
      sm: { badge: 'px-1 text-tiny' },
      md: { badge: 'px-1 text-small' },
      lg: { badge: 'px-1 text-small' },
    },
  },
  compoundVariants: [
    { isOneChar: true, class: { badge: 'px-0' } },
    // fixed diameters for a single character
    {
      isOneChar: true,
      size: 'sm',
      class: { badge: 'h-4 min-h-4 w-4 min-w-4' },
    },
    {
      isOneChar: true,
      size: 'md',
      class: { badge: 'h-5 min-h-5 w-5 min-w-5' },
    },
    {
      isOneChar: true,
      size: 'lg',
      class: { badge: 'h-6 min-h-6 w-6 min-w-6' },
    },
    // empty strings retain the compact status dot
    { isDot: true, size: 'sm', class: { badge: 'h-3 min-h-3 w-3 min-w-3' } },
    {
      isDot: true,
      size: 'md',
      class: { badge: 'h-3.5 min-h-3.5 w-3.5 min-w-3.5' },
    },
    { isDot: true, size: 'lg', class: { badge: 'h-4 min-h-4 w-4 min-w-4' } },
  ],
  defaultVariants: {
    color: 'default',
    noOutline: false,
    placement: 'top-right',
    size: 'md',
  },
});

export type VariantProps = TVProps<typeof badgeVariants>;

export type ClassName = TVClassName<typeof badgeVariants>;

export default badgeVariants;
