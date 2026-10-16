import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

export const radioTabsVariants = tv({
  slots: {
    /** Container grouping the label, tabs and hints */
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/tabs consistent.
      'gap-y-1.5',
      'relative',
    ],
    /** Highlight behind the selected tab */
    cursor: [
      '',
      // selection indicator surface
      'pointer-events-none absolute z-0 rounded-small bg-background shadow-small',
      // animate indicator position and size
      'transition-[left,top,width,height] duration-250 ease-out motion-reduce:transition-none',
      // dark theme surface
      'dark:bg-default',
    ],
    /** Supporting text below the selection */
    description: 'text-foreground-400 text-tiny',
    /** Container for validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Container grouping help text and validation messages */
    helperWrapper: '',
    /** Label above the selection */
    label: [
      'mb-2 inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
      'relative',
    ],
    /** Selectable tab button */
    tab: [
      '',
      // tab dimensions and appearance
      'outline-solid group relative z-0 flex h-8 w-full cursor-pointer items-center justify-center rounded-small px-3 py-1 outline-transparent transition-opacity text-small',
      // focus stacking and disabled state
      'data-[focus-visible=true]:z-10 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30',
      // keyboard focus outline
      'data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Container around the tab list */
    tabBase: ['', 'inline-flex w-full'],
    /** Text and icons inside a tab */
    tabContent: [
      '',
      // tab text and color transition
      'relative z-10 whitespace-nowrap text-foreground transition-colors',
      // selected text
      'group-data-[selected=true]:text-default-foreground',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Row of selectable tabs */
    tabList: [
      '',
      // tab row layout and surface
      'relative flex h-fit w-full flex-nowrap items-center gap-2 overflow-x-auto rounded-medium bg-default-100 p-1',
      // hide the horizontal scrollbar
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    ],
    /** Content associated with the selected tab */
    tabPanel: [
      'p-3',
      'outline-solid p-3 outline-transparent data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Container grouping the tab list and active panel */
    tabWrapper: '',
    /** Container around the tab engine */
    wrapper: '',
  },
  variants: {
    hasContent: {
      true: {
        base: '',
        tabBase: 'p-1',
        tabWrapper: [
          // border style
          'rounded-medium border border-divider',
          // full width
          'w-full',
        ],
      },
    },
    fullWidth: {
      true: {
        tabWrapper: 'w-full',
      },
    },
    isInvalid: {
      true: {
        tabWrapper: 'rounded-medium border-2 !border-danger',
      },
    },
    appearance: {
      bordered: {
        tabList:
          'shadow-xs border-2 border-default-200 bg-transparent dark:bg-transparent',
      },
      light: { tabList: 'bg-transparent dark:bg-transparent' },
      solid: {},
      underlined: {
        cursor:
          'rounded-none bg-foreground shadow-[0_1px_0px_0_rgba(0,0,0,0.05)] dark:bg-foreground',
        tab: 'rounded-none',
        tabList: 'rounded-none bg-transparent dark:bg-transparent',
      },
    },
  },
});

export type VariantProps = TVProps<typeof radioTabsVariants>;

export type ClassName = TVClassName<typeof radioTabsVariants>;

export type RadioTabsClassNames = Record<
  keyof ReturnType<typeof radioTabsVariants>,
  string
>;

export default radioTabsVariants;
