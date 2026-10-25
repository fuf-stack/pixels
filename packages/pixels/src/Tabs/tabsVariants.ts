import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Tab list treatments, selection indicator and panel layout */
export const tabsVariants = tv({
  slots: {
    /** Container around the tab list */
    base: 'inline-flex',
    /** Selection indicator behind the active tab label */
    cursor: [
      // selected surface and shared-element movement
      'absolute inset-0 z-0 will-change-[transform,width,height]',
      'transition-[translate,width,height] duration-250 ease-out motion-reduce:transition-none',
    ],
    /** Content associated with a tab */
    panel: [
      // panel spacing and hidden retained content
      'px-1 py-3 data-[inert=true]:hidden',
      // visible keyboard focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Focusable control for selecting a section */
    tab: [
      // control layout
      'group relative z-0 flex w-full items-center justify-center px-3 py-1',
      // disabled and pointer feedback
      'cursor-pointer transition-opacity tap-highlight-transparent data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[hover-unselected=true]:opacity-100',
      // visible keyboard focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Label and optional icon inside a tab */
    tabContent: [
      // label stacking above the selection surface
      'relative z-10 whitespace-nowrap text-foreground',
      'transition-colors group-data-[selected=true]:text-foreground',
    ],
    /** Row or column of tab controls */
    tabList: [
      // wrapping layout and overflow
      'relative flex h-fit flex-nowrap items-center gap-2 p-1',
      'overflow-x-scroll bg-default-100 scrollbar-hide',
    ],
    /** Layout positioning the tab list and its panels */
    tabWrapper: '',
  },
  variants: {
    variant: {
      solid: {},
      light: { tabList: 'bg-transparent dark:bg-transparent' },
      underlined: {
        cursor:
          'bottom-0 left-[10%] top-auto h-[2px] w-[80%] shadow-[0_1px_0px_0_rgba(0,0,0,0.05)]',
        tabList: 'bg-transparent dark:bg-transparent',
      },
      bordered: {
        tabList:
          'shadow-xs border-medium border-default-200 bg-transparent dark:bg-transparent',
      },
    },
    size: {
      sm: {
        cursor: 'rounded-small',
        tab: 'h-7 rounded-small text-tiny',
        tabList: 'rounded-medium',
      },
      md: {
        cursor: 'rounded-small',
        tab: 'h-8 rounded-small text-small',
        tabList: 'rounded-medium',
      },
      lg: {
        cursor: 'rounded-medium',
        tab: 'h-9 rounded-medium text-medium',
        tabList: 'rounded-large',
      },
    },
    radius: {
      none: {
        cursor: 'rounded-none',
        tab: 'rounded-none',
        tabList: 'rounded-none',
      },
      sm: {
        cursor: 'rounded-small',
        tab: 'rounded-small',
        tabList: 'rounded-medium',
      },
      md: {
        cursor: 'rounded-small',
        tab: 'rounded-small',
        tabList: 'rounded-medium',
      },
      lg: {
        cursor: 'rounded-medium',
        tab: 'rounded-medium',
        tabList: 'rounded-large',
      },
      full: {
        cursor: 'rounded-full',
        tab: 'rounded-full',
        tabList: 'rounded-full',
      },
    },
    fullWidth: { true: { base: 'w-full', tabList: 'w-full' } },
    disableAnimation: {
      true: { tab: 'transition-none', tabContent: 'transition-none' },
    },
    placement: {
      top: {},
      start: { panel: 'px-3 py-0', tabList: 'flex-col', tabWrapper: 'flex' },
      end: {
        panel: 'px-3 py-0',
        tabList: 'flex-col',
        tabWrapper: 'flex flex-row-reverse',
      },
      bottom: { tabWrapper: 'flex flex-col-reverse' },
    },
  },
  compoundVariants: [
    {
      variant: ['solid', 'bordered', 'light'],
      class: {
        cursor: ['bg-background', 'dark:bg-default', 'shadow-small'],
        tabContent: 'group-data-[selected=true]:text-default-foreground',
      },
    },
    {
      variant: 'underlined',
      class: {
        cursor: 'bg-foreground',
        tabContent: 'group-data-[selected=true]:text-foreground',
      },
    },
    {
      disableAnimation: true,
      variant: 'underlined',
      class: {
        tab: [
          "after:content-['']",
          'after:absolute',
          'after:bottom-0',
          'after:h-[2px]',
          'after:w-[80%]',
          'after:opacity-0',
          'after:shadow-[0_1px_0px_0_rgba(0,0,0,0.05)]',
          'data-[selected=true]:after:opacity-100',
        ],
      },
    },
    {
      disableAnimation: true,
      variant: ['solid', 'bordered', 'light'],
      class: {
        tab: 'data-[selected=true]:bg-default data-[selected=true]:text-default-foreground',
      },
    },
    {
      disableAnimation: true,
      variant: 'underlined',
      class: { tab: 'data-[selected=true]:after:bg-foreground' },
    },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    fullWidth: true,
    placement: 'top',
  },
});

export type VariantProps = TVProps<typeof tabsVariants>;

export type ClassName = TVClassName<typeof tabsVariants>;

export type TabsClassNames = Record<
  keyof ReturnType<typeof tabsVariants>,
  string
>;

export default tabsVariants;
