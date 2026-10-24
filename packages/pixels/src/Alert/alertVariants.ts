import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Message surfaces, status symbols and optional dismissal action */
export const alertVariants = tv({
  slots: {
    /** Surface around the icon, message and actions */
    base: [
      // message row and sizing
      'flex w-full min-w-72 flex-grow flex-row items-center gap-3 px-4 py-3',
      // bordered surface
      'rounded-medium border-small',
    ],
    /** Button for dismissing the message */
    closeButton: [
      // compact layout and hit target
      'group relative z-0 box-border inline-flex h-8 w-8 min-w-8 items-center justify-center !gap-0 gap-2 overflow-hidden whitespace-nowrap rounded-full px-0',
      // appearance and positioning
      '-translate-y-1 translate-x-1 transform-gpu cursor-pointer select-none appearance-none bg-transparent font-normal subpixel-antialiased tap-highlight-transparent text-tiny',
      // press feedback and reduced motion
      'transition-transform-colors-opacity data-[pressed=true]:scale-[0.97] motion-reduce:transition-none',
      // visible keyboard focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Supporting message below the title */
    description: 'pl-[1px] font-normal text-foreground text-small',
    /** Trailing content beside the message */
    endContent: '',
    /** Symbol identifying the message type */
    icon: 'absolute left-1/2 top-1/2 w-6 -translate-x-1/2 -translate-y-1/2 fill-current',
    /** Container around the message symbol */
    iconWrapper:
      'relative h-9 w-9 flex-none place-items-center rounded-full border-1 shadow-small',
    /** Container grouping the title and supporting message */
    mainWrapper:
      'ms-0 box-border flex h-full min-h-10 flex-grow flex-col items-stretch justify-center gap-1.5 text-inherit',
    /** Heading above the supporting message */
    title: 'block w-full font-medium leading-5 text-inherit text-small',
  },
  variants: {
    hasTitleAndChildren: { true: { iconWrapper: 'self-start' } },
    variant: {
      default: {
        base: 'border-default-300 bg-background text-default-foreground dark:border-default-200 dark:bg-default-50/50',
        closeButton: 'text-default-400 data-[hover=true]:bg-default/40',
        iconWrapper:
          'hidden border-default-200 bg-default-50 dark:bg-default-100',
      },
      info: {
        base: 'border-info-200 bg-info-50 text-info-600 dark:border-info-100 dark:bg-info-50',
        closeButton: 'data-[hover=true]:bg-info/20 text-info-500',
        iconWrapper: 'grid border-info-100 bg-info-50 dark:bg-info-100',
      },
      success: {
        base: 'border-success-300 bg-success-50 text-success-700 dark:border-success-100 dark:bg-success-50 dark:text-success',
        closeButton:
          'text-success-500 data-[hover=true]:bg-success/20 data-[hover]:bg-success-200',
        iconWrapper:
          'grid border-success-100 bg-success-50 dark:bg-success-100',
      },
      warning: {
        base: 'border-warning-300 bg-warning-50 text-warning-700 dark:border-warning-100 dark:bg-warning-50 dark:text-warning',
        closeButton:
          'text-warning-500 data-[hover=true]:bg-warning/20 data-[hover]:bg-warning-200',
        iconWrapper:
          'grid border-warning-100 bg-warning-50 dark:bg-warning-100',
      },
      danger: {
        base: 'border-danger-200 bg-danger-50 text-danger-600 dark:border-danger-100 dark:bg-danger-50 dark:text-danger-500',
        closeButton:
          'text-danger-500 data-[hover=true]:bg-danger/20 data-[hover]:bg-danger-200',
        iconWrapper: 'grid border-danger-100 bg-danger-50 dark:bg-danger-100',
      },
    },
  },
  defaultVariants: { variant: 'info' },
});

export type VariantProps = TVProps<typeof alertVariants>;

export type ClassName = TVClassName<typeof alertVariants>;

export default alertVariants;
