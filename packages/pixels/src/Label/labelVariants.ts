import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Compact label surface, content, status dot and close control */
export const labelVariants = tv({
  slots: {
    /** Surface around the label content and optional controls */
    base: 'relative box-border inline-flex min-w-min max-w-fit items-center justify-between whitespace-nowrap',
    /** Dismiss action at the end of the label */
    closeButton: [
      // reset the native button and retain the compact hit target
      'z-10 cursor-pointer select-none appearance-none tap-highlight-transparent',
      // interaction feedback and keyboard focus
      'opacity-70 transition-opacity hover:opacity-100 active:opacity-disabled motion-reduce:transition-none',
      'outline-solid outline-transparent data-[focus-visible=true]:rounded-full data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-focus data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background',
    ],
    /** Text and optional leading icon */
    content: 'flex-1 font-normal text-inherit',
    /** Colored status marker for the dot treatment */
    dot: 'ml-1 h-2 w-2 rounded-full',
    /** Trailing element kept within the label height */
    endContent: 'max-h-[80%]',
    /** Icon before the label text */
    icon: '',
  },
  variants: {
    closeable: { true: {} },
    color: {
      default: {
        dot: 'bg-default-400',
      },
      primary: {
        dot: 'bg-primary',
      },
      secondary: {
        dot: 'bg-secondary',
      },
      success: {
        dot: 'bg-success',
      },
      warning: {
        dot: 'bg-warning',
      },
      danger: {
        dot: 'bg-danger',
      },
      info: {
        dot: 'bg-info',
      },
    },
    hasEndContent: { true: { base: 'pr-2' } },
    isIconOnly: {
      true: { content: 'px-1' },
      false: { content: 'flex items-center gap-2' },
    },
    radius: {
      none: { base: 'rounded-none' },
      sm: { base: 'rounded-small' },
      md: { base: 'rounded-medium' },
      lg: { base: 'rounded-large' },
      full: { base: 'rounded-full' },
    },
    size: {
      sm: {
        base: 'h-6 px-1 text-tiny',
        closeButton: 'text-medium',
        content: 'px-1',
      },
      md: {
        base: 'h-7 px-1 text-small',
        closeButton: 'text-large',
        content: 'px-2',
      },
      lg: {
        base: 'h-8 px-2 text-medium',
        closeButton: 'text-xl',
        content: 'px-2',
      },
    },
    variant: {
      solid: {},
      bordered: {
        base: 'border-medium bg-transparent',
      },
      light: {
        base: 'bg-transparent',
      },
      flat: {},
      faded: {
        base: 'border-medium',
      },
      shadow: {},
      dot: {
        base: 'border-medium border-default bg-transparent text-foreground',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'default',
      class: {
        base: 'bg-default text-default-foreground',
      },
    },
    {
      variant: 'solid',
      color: 'primary',
      class: {
        base: 'bg-primary text-primary-foreground',
      },
    },
    {
      variant: 'solid',
      color: 'secondary',
      class: {
        base: 'bg-secondary text-secondary-foreground',
      },
    },
    {
      variant: 'solid',
      color: 'success',
      class: {
        base: 'bg-success text-success-foreground',
      },
    },
    {
      variant: 'solid',
      color: 'warning',
      class: {
        base: 'bg-warning text-warning-foreground',
      },
    },
    {
      variant: 'solid',
      color: 'danger',
      class: {
        base: 'bg-danger text-danger-foreground',
      },
    },
    {
      variant: 'shadow',
      color: 'default',
      class: {
        base: 'bg-default text-default-foreground shadow-lg shadow-default/50',
      },
    },
    {
      variant: 'shadow',
      color: 'primary',
      class: {
        base: 'bg-primary text-primary-foreground shadow-lg shadow-primary/40',
      },
    },
    {
      variant: 'shadow',
      color: 'secondary',
      class: {
        base: 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40',
      },
    },
    {
      variant: 'shadow',
      color: 'success',
      class: {
        base: 'bg-success text-success-foreground shadow-lg shadow-success/40',
      },
    },
    {
      variant: 'shadow',
      color: 'warning',
      class: {
        base: 'bg-warning text-warning-foreground shadow-lg shadow-warning/40',
      },
    },
    {
      variant: 'shadow',
      color: 'danger',
      class: {
        base: 'bg-danger text-danger-foreground shadow-lg shadow-danger/40',
      },
    },
    {
      variant: 'bordered',
      color: 'default',
      class: {
        base: 'border-default bg-transparent text-foreground',
      },
    },
    {
      variant: 'bordered',
      color: 'primary',
      class: {
        base: 'border-primary bg-transparent text-primary',
      },
    },
    {
      variant: 'bordered',
      color: 'secondary',
      class: {
        base: 'border-secondary bg-transparent text-secondary',
      },
    },
    {
      variant: 'bordered',
      color: 'success',
      class: {
        base: 'border-success bg-transparent text-success',
      },
    },
    {
      variant: 'bordered',
      color: 'warning',
      class: {
        base: 'border-warning bg-transparent text-warning',
      },
    },
    {
      variant: 'bordered',
      color: 'danger',
      class: {
        base: 'border-danger bg-transparent text-danger',
      },
    },
    {
      variant: 'flat',
      color: 'default',
      class: {
        base: 'bg-default/40 text-default-700',
      },
    },
    {
      variant: 'flat',
      color: 'primary',
      class: {
        base: 'bg-primary/20 text-primary-600',
      },
    },
    {
      variant: 'flat',
      color: 'secondary',
      class: {
        base: 'bg-secondary/20 text-secondary-600',
      },
    },
    {
      variant: 'flat',
      color: 'success',
      class: {
        base: 'bg-success/20 text-success-700 dark:text-success',
      },
    },
    {
      variant: 'flat',
      color: 'warning',
      class: {
        base: 'bg-warning/20 text-warning-700 dark:text-warning',
      },
    },
    {
      variant: 'flat',
      color: 'danger',
      class: {
        base: 'bg-danger/20 text-danger-600 dark:text-danger-500',
      },
    },
    {
      variant: 'faded',
      color: 'default',
      class: {
        base: 'border-default bg-default-100 text-default-foreground',
      },
    },
    {
      variant: 'faded',
      color: 'primary',
      class: {
        base: 'border-default bg-default-100 text-primary',
      },
    },
    {
      variant: 'faded',
      color: 'secondary',
      class: {
        base: 'border-default bg-default-100 text-secondary',
      },
    },
    {
      variant: 'faded',
      color: 'success',
      class: {
        base: 'border-default bg-default-100 text-success',
      },
    },
    {
      variant: 'faded',
      color: 'warning',
      class: {
        base: 'border-default bg-default-100 text-warning',
      },
    },
    {
      variant: 'faded',
      color: 'danger',
      class: {
        base: 'border-default bg-default-100 text-danger',
      },
    },
    {
      variant: 'light',
      color: 'default',
      class: {
        base: 'bg-transparent text-default-foreground',
      },
    },
    {
      variant: 'light',
      color: 'primary',
      class: {
        base: 'bg-transparent text-primary',
      },
    },
    {
      variant: 'light',
      color: 'secondary',
      class: {
        base: 'bg-transparent text-secondary',
      },
    },
    {
      variant: 'light',
      color: 'success',
      class: {
        base: 'bg-transparent text-success',
      },
    },
    {
      variant: 'light',
      color: 'warning',
      class: {
        base: 'bg-transparent text-warning',
      },
    },
    {
      variant: 'light',
      color: 'danger',
      class: {
        base: 'bg-transparent text-danger',
      },
    },
    {
      variant: 'solid',
      color: 'info',
      class: {
        base: 'bg-info text-info-foreground',
      },
    },
    {
      variant: 'bordered',
      color: 'info',
      class: {
        base: 'border-info text-info',
      },
    },
    {
      variant: 'light',
      color: 'info',
      class: {
        base: 'text-info',
      },
    },
    {
      variant: 'flat',
      color: 'info',
      class: {
        base: 'bg-info/20 text-info-600',
      },
    },
    {
      variant: 'faded',
      color: 'info',
      class: {
        base: 'border-default bg-default-100 text-info',
      },
    },
    {
      hasEndContent: true,
      size: 'sm',
      class: {
        content: 'pr-0.5',
      },
    },
    {
      hasEndContent: true,
      size: ['md', 'lg'],
      class: {
        content: 'pr-1',
      },
    },
    {
      closeable: true,
      size: 'sm',
      class: {
        content: 'pr-0.5',
      },
    },
    {
      closeable: true,
      size: ['md', 'lg'],
      class: {
        content: 'pr-1',
      },
    },
    {
      hasEndContent: true,
      class: {
        base: 'pr-2',
      },
    },
    {
      isIconOnly: true,
      class: {
        content: 'px-1',
      },
    },
  ],
  defaultVariants: {
    color: 'default',
    radius: 'full',
    size: 'md',
    variant: 'solid',
  },
});

export type VariantProps = TVProps<typeof labelVariants>;

export type ClassName = TVClassName<typeof labelVariants>;

export type LabelClassNames = Record<
  keyof ReturnType<typeof labelVariants>,
  string
>;

export default labelVariants;
