import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { timeVariants } from '../Time/timeVariants';

export const datePickerVariants = tv({
  extend: timeVariants,
  slots: {
    /** Container for the date input and supporting text */
    base: '',
    /** Supporting text below the input surface */
    helperWrapper: [
      // set padding to 0 for error message exit animation
      'p-0',
    ],
    /** Calendar panel inside the popup */
    calendar: '',
    /** Calendar grid and navigation area */
    calendarContent: '',
    /** Input surface with a focus indicator */
    inputWrapper: 'bg-content1 focus-within:border-focus',
    /** Label above the date input */
    label: 'cursor-default',
    /** Floating surface around the calendar */
    popoverContent: '',
    /** Button opening the calendar popup */
    selectorButton: '',
    /** Icon inside the calendar toggle */
    selectorIcon: '',
    /** Time input below the calendar */
    timeInput: '',
    /** Label beside the calendar time input */
    timeInputLabel: '',
  },
});

export type VariantProps = TVProps<typeof datePickerVariants>;
export type ClassName = TVClassName<typeof datePickerVariants>;

export const datePickerStateVariants = tv({
  extend: datePickerVariants,
  slots: {
    /** Invalid label color */
    label: 'group-data-[invalid=true]:text-danger',
    /** Invalid input border states */
    inputWrapper:
      'group-data-[invalid=true]:border-danger group-data-[invalid=true]:focus-within:border-danger group-data-[invalid=true]:hover:border-danger group-data-[invalid=true]:focus-within:hover:border-danger',
    /** Invalid editable value and separator states */
    segment:
      'data-[invalid=true]:data-[editable=true]:data-[placeholder=true]:text-danger data-[invalid=true]:data-[editable=true]:text-danger data-[invalid=true]:text-danger-300 data-[invalid=true]:focus:bg-danger-400/50 data-[invalid=true]:data-[editable=true]:focus:text-danger dark:data-[invalid=true]:focus:bg-danger-400/20',
    /** Invalid color for content beside segments */
    innerWrapper: 'group-data-[invalid=true]:text-danger',
    /** Button opening the calendar popup */
    selectorButton:
      'outline-solid relative -mx-2 inline-flex h-8 min-h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-full text-inherit outline-transparent text-tiny hover:bg-default/40 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    /** Icon inside the calendar toggle */
    selectorIcon: 'h-[18px] w-[18px]',
    /** Floating surface around the calendar */
    popoverContent:
      'z-50 rounded-large bg-content1 shadow-medium outline-none text-small',
    /** Keyboard focus boundary inside the popup */
    dialog: 'flex flex-col outline-none',
    /** Calendar panel inside the popup */
    calendar:
      'relative inline-block w-64 max-w-full overflow-hidden rounded-large bg-default-50 dark:bg-background',
    /** Calendar grid and navigation area */
    calendarContent: 'w-full',
    /** Row containing month navigation */
    calendarHeader:
      'flex items-center justify-between gap-2 bg-content1 px-4 py-2',
    /** Currently displayed month and year */
    calendarTitle: 'flex-1 text-center font-medium text-default-500 text-small',
    /** Previous or next month button */
    calendarButton:
      'outline-solid flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-default-400 outline-transparent hover:bg-default/40 data-[disabled=true]:opacity-disabled data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    /** Viewport around the calendar grid */
    gridWrapper: 'relative flex h-auto max-w-full overflow-hidden pb-2',
    /** Table of selectable dates */
    grid: 'z-0 w-full border-collapse',
    /** Row containing weekday headings */
    gridHeader:
      'bg-content1 shadow-[0px_20px_20px_0px_rgb(0_0_0/0.05)] [&>tr]:flex [&>tr]:justify-center [&>tr]:px-4 [&>tr]:pb-2',
    /** Individual weekday heading */
    gridHeaderCell:
      'flex w-8 items-center justify-center font-medium text-default-400 text-small',
    /** Rows containing calendar dates */
    gridBody:
      '[&>tr:first-child]:mt-2 [&>tr>td]:px-0 [&>tr>td]:py-0.5 [&>tr]:flex [&>tr]:items-center [&>tr]:justify-center',
    /** Selectable date with interaction states */
    cell: 'outline-solid flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-full text-foreground outline-transparent transition-colors data-[focus-visible=true]:z-10 data-[disabled=true]:cursor-default data-[unavailable=true]:cursor-default data-[hovered=true]:bg-primary-50 data-[selected=true]:bg-primary data-[selected=true]:data-[hovered=true]:bg-primary data-[disabled=true]:text-default-300 data-[hovered=true]:text-primary-400 data-[selected=true]:data-[hovered=true]:text-primary-foreground data-[selected=true]:text-primary-foreground data-[unavailable=true]:text-default-300 data-[unavailable=true]:line-through data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus motion-reduce:transition-none',
    /** Time input below the calendar */
    timeInput:
      'group flex w-full flex-row flex-wrap items-center gap-x-6 px-5 pb-4',
    /** Label beside the calendar time input */
    timeInputLabel: 'relative font-medium text-foreground text-tiny',
    /** Surface around the calendar time segments */
    timeInputWrapper:
      'shadow-xs relative inline-flex h-8 min-h-8 w-full flex-1 items-center rounded-small bg-default-100 px-2 hover:bg-default-200 focus-within:hover:bg-default-100',
  },
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
  },
});
