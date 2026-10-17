import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Content surface with optional header, footer and dividing rules */
export const cardVariants = tv({
  slots: {
    /** Surface containing all card sections */
    base: [
      // stacked sections and clipping
      'relative box-border flex h-auto w-full flex-col overflow-hidden',
      // border and background
      'rounded-small border border-divider bg-content1 text-foreground shadow-none',
      // focus feedback for programmatic focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      'transition-transform-background motion-reduce:transition-none',
    ],
    /** Scrollable main content between the optional sections */
    body: [
      // flexible content area
      'relative flex h-auto w-full flex-auto flex-col p-3',
      // inherited alignment and text wrapping
      'place-content-inherit align-items-inherit overflow-y-auto break-words text-left subpixel-antialiased',
    ],
    /** Horizontal rule between adjacent sections */
    divider:
      'my-0 h-divider w-full shrink-0 border-none border-divider bg-divider',
    /** Supporting content below the body */
    footer: [
      // supporting row beneath the body
      'color-inherit flex h-auto w-full items-center overflow-hidden rounded-b-small p-3',
      'subpixel-antialiased',
    ],
    /** Heading content above the body */
    header: [
      // heading row above the body
      'color-inherit overflow-inherit z-auto flex w-full shrink-0 items-center justify-start rounded-t-small p-3',
      // heading typography
      'text-base font-semibold subpixel-antialiased',
    ],
  },
});

export type VariantProps = TVProps<typeof cardVariants>;

export type ClassName = TVClassName<typeof cardVariants>;

export default cardVariants;
