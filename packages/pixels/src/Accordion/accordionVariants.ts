import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Expandable item surfaces, headings and group dividers */
export const accordionVariants = tv({
  slots: {
    /** Surface around one heading and its panel */
    base: 'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled',
    /** Content inside an expanded panel */
    content: 'px-4 py-2',
    /** Heading around the expand and collapse action */
    heading: 'px-4',
    /** Chevron showing the current expansion state */
    indicator: [
      'text-default-400',
      'rotate-0 transition-transform data-[open=true]:-rotate-90 motion-reduce:transition-none rtl:-rotate-180 rtl:data-[open=true]:-rotate-90',
    ],
    /** Leading content before the title */
    startContent: 'shrink-0',
    /** Supporting text below the title */
    subtitle: 'font-normal text-foreground-500 text-small',
    /** Main text naming the panel */
    title: 'text-foreground text-medium',
    /** Container grouping the title and subtitle */
    titleWrapper: 'flex flex-1 flex-col text-start',
    /** Button that expands or collapses the panel */
    trigger: [
      // heading layout and hit target
      'flex h-full w-full cursor-pointer items-center gap-3 py-4 tap-highlight-transparent',
      // interaction feedback and keyboard focus
      'outline-solid outline-transparent transition-opacity motion-reduce:transition-none',
      'data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Container arranging the expandable items */
    wrapper: 'w-full px-0',
  },
  variants: {
    indicatorLeft: {
      true: {
        content: 'pl-7',
        indicator: '-rotate-180 data-[open=true]:-rotate-90',
        trigger: 'flex-row-reverse',
      },
    },
    showDivider: { true: { wrapper: 'divide-y divide-solid divide-divider' } },
    showBottomTopDivider: {
      true: { wrapper: 'border-y border-solid border-divider' },
    },
    variant: {
      light: {},
      shadow: { wrapper: 'rounded-medium bg-content1 shadow-medium' },
      bordered: { wrapper: 'rounded-medium border-medium border-divider' },
      splitted: {
        base: 'rounded-medium bg-content1 px-4 shadow-medium',
        wrapper: 'flex flex-col gap-2',
      },
    },
  },
});

export type VariantProps = TVProps<typeof accordionVariants>;

export type ClassName = TVClassName<typeof accordionVariants>;

export type AccordionClassNames = Record<
  keyof ReturnType<typeof accordionVariants>,
  string
>;

export default accordionVariants;
