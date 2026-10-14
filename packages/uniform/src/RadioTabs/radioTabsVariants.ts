import { tv } from '@fuf-stack/pixel-utils';

const radioTabsVariants = tv({
  slots: {
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/tabs consistent.
      'gap-y-1.5',
    ],
    cursor: '',
    label:
      'mb-2 inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    tab: '',
    tabBase: '',
    tabContent: '',
    tabList: '',
    tabPanel: 'p-3',
    tabWrapper: '',
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
