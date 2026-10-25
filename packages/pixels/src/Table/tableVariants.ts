import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Table surfaces, row separation and keyboard focus styles */
export const tableVariants = tv({
  slots: {
    /** Container around the table and optional card surface */
    base: 'relative flex w-full flex-col gap-4',
    /** Message shown when no rows are available */
    emptyWrapper:
      'flex h-40 items-center justify-center text-center text-foreground-400',
    /** Overlay announcing a pending load */
    loadingWrapper: 'absolute inset-0 flex items-center justify-center',
    /** Reserved indicator slot for column sorting */
    sortIcon: [
      // layout and appearance
      'mb-px ms-2 inline-block text-inherit opacity-0 transition-transform-opacity',
      // interaction states
      'data-[direction=ascending]:rotate-180 data-[visible=true]:opacity-100 group-data-[hover=true]/th:opacity-100',
    ],
    /** Native grid containing the header and body */
    table: 'h-auto w-full min-w-full table-auto',
    /** Group of data rows */
    tbody: 'after:block',
    /** Data cell or row heading */
    td: [
      // cell spacing and content
      '[&>*]:z-1 relative whitespace-normal px-3 py-2 text-start align-middle font-normal text-small [&>*]:relative',
      // visible keyboard focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // background layer follows row selection and striping
      "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-default/60 before:opacity-0 before:content-[''] first:before:rounded-s-lg last:before:rounded-e-lg data-[selected=true]:before:opacity-100",
      // disabled and selected text
      'data-[selected=true]:text-default-foreground group-data-[disabled=true]/tr:cursor-not-allowed group-data-[disabled=true]/tr:text-foreground-300',
    ],
    /** Reserved footer row-group slot */
    tfoot: '',
    /** Column heading and focus target */
    th: [
      // heading dimensions and typography
      'group/th h-10 whitespace-nowrap bg-content2 px-3 text-start align-middle font-semibold text-foreground-500 text-tiny first:rounded-s-lg last:rounded-e-lg',
      // pointer and keyboard feedback
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[sortable=true]:cursor-pointer data-[hover=true]:text-foreground-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Group of column headings */
    thead: [
      // layout and appearance
      '[&>tr]:first:rounded-lg',
      // spacing between the heading and body rows
      "after:table-row after:h-[5px] after:content-['']",
    ],
    /** Header or data row */
    tr: [
      // layout and appearance
      'group/tr outline-solid outline-transparent',
      // interaction states
      'data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Optional scrolling card surface */
    wrapper: [
      // scrollable card layout
      'relative z-0 flex w-full flex-col justify-between gap-4 overflow-auto p-4',
      // surface appearance
      'rounded-large bg-content1 shadow-small',
    ],
  },
  variants: {
    hideHeader: { true: { thead: 'hidden' } },
    separation: {
      divider: {
        tr: 'divide-x rounded-lg border-b data-[last=true]:border-none [&:first-child:not([data-first="true"])]:border-none',
      },
      'divider-x': { tr: 'divide-x' },
      'divider-y': {
        tr: 'rounded-lg border-b data-[last=true]:border-none [&:first-child:not([data-first="true"])]:border-none',
      },
      'striped-divider-x': {
        td: 'border-divider first:rounded-s-lg last:rounded-e-lg group-data-[odd=true]:bg-content2 group-data-[odd=true]/tr:before:-z-10 group-data-[odd=true]/tr:before:bg-default-100 group-data-[odd=true]/tr:before:opacity-100',
        th: 'border-divider',
        tr: 'divide-x',
      },
      striped: {
        td: 'first:rounded-s-lg last:rounded-e-lg group-data-[odd=true]:bg-content2 group-data-[odd=true]/tr:before:-z-10 group-data-[odd=true]/tr:before:bg-default-100 group-data-[odd=true]/tr:before:opacity-100',
      },
      none: {},
    },
    stickyHeader: {
      true: { thead: 'sticky top-0 z-20 [&>tr]:first:shadow-small' },
    },
  },
});

export type VariantProps = TVProps<typeof tableVariants>;

export type ClassName = TVClassName<typeof tableVariants>;

export type TableClassNames = Record<
  keyof ReturnType<typeof tableVariants>,
  string
>;

export default tableVariants;
