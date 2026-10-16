import { tv } from '@fuf-stack/pixel-utils';

const radioTabsVariants = tv({
  slots: {
    /** Container grouping the label, tabs and hints */
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/tabs consistent.
      'gap-y-1.5',
    ],
    /** Highlight behind the selected tab */
    cursor: '',
    /** Supporting text below the selection */
    description: 'text-foreground-400 text-tiny',
    /** Container for validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Container grouping help text and validation messages */
    helperWrapper: '',
    /** Label above the selection */
    label:
      'mb-2 inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    /** Selectable tab button */
    tab: '',
    /** Container around the tab list */
    tabBase: '',
    /** Text and icons inside a tab */
    tabContent: '',
    /** Row of selectable tabs */
    tabList: '',
    /** Content associated with the selected tab */
    tabPanel: 'p-3',
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
  },
});

export default radioTabsVariants;
