import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { segmentedInputVariants } from '../Time/timeVariants';

export const datePickerVariants = tv({
  extend: segmentedInputVariants,
  slots: {
    /** Container for the date input and supporting text */
    base: '',
    /** Calendar panel inside the popup */
    calendar: [
      '',
      'relative inline-block w-64 max-w-full overflow-hidden rounded-large bg-default-50 dark:bg-background',
    ],
    /** Previous or next month button */
    calendarButton: [
      // navigation button layout and appearance
      'outline-solid flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-default-400 outline-transparent',
      // hover and disabled states
      'hover:bg-default/40 data-[disabled=true]:opacity-disabled',
      // keyboard focus outline
      'data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Calendar grid and navigation area */
    calendarContent: ['', 'w-full'],
    /** Row containing month navigation */
    calendarHeader:
      'flex items-center justify-between gap-2 bg-content1 px-4 py-2',
    /** Currently displayed month and year */
    calendarTitle: 'flex-1 text-center font-medium text-default-500 text-small',
    /** Selectable date with interaction states */
    cell: [
      // day cell layout and appearance
      'outline-solid flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-full text-foreground outline-transparent transition-colors',
      // focus stacking and unavailable cursors
      'data-[focus-visible=true]:z-10 data-[disabled=true]:cursor-default data-[unavailable=true]:cursor-default',
      // hover and selection backgrounds
      'data-[hovered=true]:bg-primary-50 data-[selected=true]:bg-primary data-[selected=true]:data-[hovered=true]:bg-primary',
      // day text states
      'data-[disabled=true]:text-default-300 data-[hovered=true]:text-primary-400 data-[selected=true]:data-[hovered=true]:text-primary-foreground data-[selected=true]:text-primary-foreground data-[unavailable=true]:text-default-300 data-[unavailable=true]:line-through',
      // keyboard focus outline
      'data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Keyboard focus boundary inside the popup */
    dialog: 'flex flex-col outline-none',
    /** Table of selectable dates */
    grid: 'z-0 w-full border-collapse',
    /** Rows containing calendar dates */
    gridBody:
      '[&>tr:first-child]:mt-2 [&>tr>td]:px-0 [&>tr>td]:py-0.5 [&>tr]:flex [&>tr]:items-center [&>tr]:justify-center',
    /** Row containing weekday headings */
    gridHeader:
      'bg-content1 shadow-[0px_20px_20px_0px_rgb(0_0_0/0.05)] [&>tr]:flex [&>tr]:justify-center [&>tr]:px-4 [&>tr]:pb-2',
    /** Individual weekday heading */
    gridHeaderCell:
      'flex w-8 items-center justify-center font-medium text-default-400 text-small',
    /** Viewport around the calendar grid */
    gridWrapper: 'relative flex h-auto max-w-full overflow-hidden pb-2',
    /** Supporting text below the input surface */
    helperWrapper: [
      // set padding to 0 for error message exit animation
      'p-0',
    ],
    /** Invalid color for content beside segments */
    innerWrapper: 'group-data-[invalid=true]:text-danger',
    /** Input surface with a focus indicator */
    inputWrapper: [
      'bg-content1 focus-within:border-focus',
      'group-data-[invalid=true]:border-danger group-data-[invalid=true]:focus-within:border-danger group-data-[invalid=true]:hover:border-danger group-data-[invalid=true]:focus-within:hover:border-danger',
    ],
    /** Label above the date input */
    label: ['cursor-default', 'group-data-[invalid=true]:text-danger'],
    /** Floating surface around the calendar */
    popoverContent: [
      '',
      'z-50 rounded-large bg-content1 shadow-medium outline-none text-small',
    ],
    /** Invalid editable value and separator states */
    segment:
      'data-[invalid=true]:data-[editable=true]:data-[placeholder=true]:text-danger data-[invalid=true]:data-[editable=true]:text-danger data-[invalid=true]:text-danger-300 data-[invalid=true]:focus:bg-danger-400/50 data-[invalid=true]:data-[editable=true]:focus:text-danger dark:data-[invalid=true]:focus:bg-danger-400/20',
    /** Button opening the calendar popup */
    selectorButton: [
      '',
      // calendar trigger layout and appearance
      'outline-solid relative -mx-2 inline-flex h-8 min-h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-full text-inherit outline-transparent text-tiny',
      // hover background
      'hover:bg-default/40',
      // keyboard focus outline
      'data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Icon inside the calendar toggle */
    selectorIcon: ['', 'h-[18px] w-[18px]'],
    /** Time input below the calendar */
    timeInput: [
      '',
      'group flex w-full flex-row flex-wrap items-center gap-x-6 px-5 pb-4',
    ],
    /** Label beside the calendar time input */
    timeInputLabel: ['', 'relative font-medium text-foreground text-tiny'],
    /** Surface around the calendar time segments */
    timeInputWrapper: [
      // time input frame and surface
      'shadow-xs relative inline-flex h-8 min-h-8 w-full flex-1 items-center rounded-small bg-default-100 px-2',
      // hover and focus backgrounds
      'hover:bg-default-200 focus-within:hover:bg-default-100',
    ],
  },
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
  },
});

export type VariantProps = TVProps<typeof datePickerVariants>;

export type ClassName = TVClassName<typeof datePickerVariants>;

/** Resolved class names for the date input and calendar slots */
export type DatePickerClassNames = Record<
  keyof ReturnType<typeof datePickerVariants>,
  string
>;
