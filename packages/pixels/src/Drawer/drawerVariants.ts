import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { modalVariants } from '../Modal/modalVariants';

/** Edge-aligned dialog surfaces, backdrop choices and rounded corners */
export const drawerVariants = tv({
  extend: modalVariants,
  slots: {
    /** Edge-aligned dialog containing its sections */
    base: 'absolute m-0 overflow-y-auto sm:m-0',
    /** Scrollable content between the heading and footer */
    body: 'py-2',
    /** Actions below the drawer body */
    footer: 'border-t-0',
    /** Title above the drawer body */
    header: 'border-b-0',
  },
  variants: {
    backdrop: {
      opaque: { backdrop: 'bg-overlay/50 backdrop-opacity-disabled' },
      transparent: { backdrop: 'hidden' },
      blur: {
        backdrop:
          'bg-overlay/30 backdrop-blur-md backdrop-opacity-100 backdrop-saturate-150',
      },
    },
    radius: {
      none: { base: 'rounded-none' },
      sm: { base: 'rounded-small' },
      md: { base: 'rounded-medium' },
      lg: { base: 'rounded-large' },
    },
    size: {
      xs: { base: 'max-h-[20rem] max-w-xs' },
      sm: { base: 'max-h-[24rem] max-w-sm' },
      md: { base: 'max-h-[28rem] max-w-md' },
      lg: { base: 'max-h-[32rem] max-w-lg' },
      xl: { base: 'max-h-[36rem] max-w-xl' },
      '2xl': { base: 'max-h-[42rem] max-w-2xl' },
      '3xl': { base: 'max-h-[48rem] max-w-3xl' },
      '4xl': { base: 'max-h-[56rem] max-w-4xl' },
      '5xl': { base: 'max-h-[64rem] max-w-5xl' },
      full: { base: 'h-dvh max-h-full min-h-dvh max-w-full !rounded-none' },
    },
    placement: {
      top: { base: 'inset-x-0 top-0 max-w-[none] rounded-t-none' },
      right: { base: 'inset-y-0 right-0 max-h-[none] rounded-r-none' },
      bottom: { base: 'inset-x-0 bottom-0 max-w-[none] rounded-b-none' },
      left: { base: 'inset-y-0 left-0 max-h-[none] rounded-l-none' },
    },
  },
});

export const drawerSizes = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  'full',
] as const;

export type DrawerSizes = (typeof drawerSizes)[number];

export const drawerRadii = ['none', 'sm', 'md', 'lg'] as const;

export type DrawerRadius = (typeof drawerRadii)[number];

export const drawerBackdrops = ['opaque', 'transparent', 'blur'] as const;

export type DrawerBackdrop = (typeof drawerBackdrops)[number];

export const drawerPlacements = ['left', 'right', 'top', 'bottom'] as const;

export type DrawerPlacement = (typeof drawerPlacements)[number];

export type VariantProps = TVProps<typeof drawerVariants>;

export type ClassName = TVClassName<typeof drawerVariants>;

export default drawerVariants;
