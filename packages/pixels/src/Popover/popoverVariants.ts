import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { buttonVariants } from '../Button/buttonVariants';

/** Popover surface, sections and trigger styles */
export const popoverVariants = tv({
  slots: {
    /** Dialog surface and directional arrow */
    base: [
      // dialog surface
      'relative z-0 bg-transparent outline-none',
      // arrow surface
      "before:absolute before:z-[-1] before:hidden before:h-2.5 before:w-2.5 before:rotate-45 before:rounded-sm before:content-[''] data-[arrow=true]:before:block",
      'before:bg-content1 before:shadow-small',
      // arrow on the top side of the trigger
      'data-[placement=top]:before:-bottom-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=top]:before:left-1/2 data-[placement=top]:before:-translate-x-1/2',
      'data-[placement=top-start]:before:-bottom-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=top-start]:before:left-3',
      'data-[placement=top-end]:before:-bottom-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=top-end]:before:right-3',
      // arrow on the bottom side of the trigger
      'data-[placement=bottom]:before:-top-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=bottom]:before:left-1/2 data-[placement=bottom]:before:-translate-x-1/2',
      'data-[placement=bottom-start]:before:-top-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=bottom-start]:before:left-3',
      'data-[placement=bottom-end]:before:-top-[calc(theme(spacing.5)/4_-_1.5px)] data-[placement=bottom-end]:before:right-3',
      // arrow on the left side of the trigger
      'data-[placement=left]:before:-right-[calc(theme(spacing.5)/4_-_2px)] data-[placement=left]:before:top-1/2 data-[placement=left]:before:-translate-y-1/2',
      'data-[placement=left-start]:before:-right-[calc(theme(spacing.5)/4_-_3px)] data-[placement=left-start]:before:top-1/4',
      'data-[placement=left-end]:before:-right-[calc(theme(spacing.5)/4_-_3px)] data-[placement=left-end]:before:bottom-1/4',
      // arrow on the right side of the trigger
      'data-[placement=right]:before:-left-[calc(theme(spacing.5)/4_-_2px)] data-[placement=right]:before:top-1/2 data-[placement=right]:before:-translate-y-1/2',
      'data-[placement=right-start]:before:-left-[calc(theme(spacing.5)/4_-_3px)] data-[placement=right-start]:before:top-1/4',
      'data-[placement=right-end]:before:-left-[calc(theme(spacing.5)/4_-_3px)] data-[placement=right-end]:before:bottom-1/4',
    ],
    /** Scrollable content between the header and footer */
    body: 'w-full px-4 py-2',
    /** Rounded panel containing all sections */
    content: [
      // section layout and viewport limit
      'relative z-10 box-border flex max-h-[80vh] w-full flex-col items-center justify-center p-0',
      // surface and typography
      'outline-solid rounded-small bg-content1 subpixel-antialiased shadow-medium outline-transparent text-small',
    ],
    /** Separator between sections */
    divider: 'm-0 w-full border-divider p-0',
    /** Content below the body */
    footer: 'w-full px-4 py-2',
    /** Footer and its separator */
    footerWrapper: 'w-full',
    /** Title above the body */
    header: 'w-full px-4 pb-1 pt-2 font-semibold',
    /** Header and its separator */
    headerWrapper: 'w-full',
    /** Positioned overlay with entry and exit feedback */
    overlay: [
      // centered placement origins
      'origin-bottom data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left',
      // aligned placement origins
      'data-[placement=bottom-end]:origin-top-right data-[placement=bottom-start]:origin-top-left data-[placement=top-end]:origin-bottom-right data-[placement=top-start]:origin-bottom-left',
      'data-[placement=left-end]:origin-bottom-right data-[placement=left-start]:origin-top-right data-[placement=right-end]:origin-bottom-left data-[placement=right-start]:origin-top-left',
    ],
    /** Button that opens the popover */
    trigger:
      'z-10 subpixel-antialiased aria-expanded:scale-[0.97] aria-expanded:opacity-70',
  },
});

/** Styled trigger colors, including the existing success and warning foregrounds */
export const popoverTriggerVariants = tv({
  extend: buttonVariants,
  compoundVariants: [
    { color: 'success', variant: 'solid', class: 'text-success-foreground' },
    { color: 'success', variant: 'shadow', class: 'text-success-foreground' },
    { color: 'warning', variant: 'solid', class: 'text-warning-foreground' },
    { color: 'warning', variant: 'shadow', class: 'text-warning-foreground' },
  ],
});

export type VariantProps = TVProps<typeof popoverVariants>;

export type ClassName = TVClassName<typeof popoverVariants>;

export type PopoverClassNames = Record<
  keyof ReturnType<typeof popoverVariants>,
  string
>;

export default popoverVariants;
