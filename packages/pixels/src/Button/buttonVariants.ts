import type { TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Button appearance, interaction states and grouped edges */
export const buttonVariants = tv({
  base: [
    // position and inline layout
    'group relative z-0 box-border inline-flex items-center justify-center',
    // native appearance and text
    'outline-solid min-w-max select-none appearance-none whitespace-nowrap font-normal subpixel-antialiased outline-transparent',
    // clipped press feedback
    'transform-gpu cursor-pointer overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97]',
    // keyboard focus ring
    'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
  ],
  variants: {
    variant: {
      solid: '',
      bordered: 'border-medium bg-transparent',
      light: 'bg-transparent',
      flat: '',
      faded: 'border-medium',
      shadow: '',
      ghost: 'border-medium bg-transparent',
    },
    size: {
      sm: 'h-8 min-w-16 gap-2 rounded-small px-3 text-tiny',
      md: 'h-10 min-w-20 gap-2 rounded-medium px-4 text-small',
      lg: 'h-12 min-w-24 gap-3 rounded-large px-6 text-medium',
    },
    color: {
      default: '',
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-small',
      md: 'rounded-medium',
      lg: 'rounded-large',
      full: 'rounded-full',
    },
    fullWidth: {
      true: 'w-full',
    },
    isDisabled: {
      true: 'pointer-events-none opacity-disabled',
    },
    isInGroup: {
      true: '[&:not(:first-child):not(:last-child)]:rounded-none',
    },
    isIconOnly: {
      true: '!gap-0 px-0',
      false: '[&>svg]:max-w-[theme(spacing.8)]',
    },
    disableAnimation: {
      true: '!transition-none data-[pressed=true]:scale-100',
      false:
        'transition-transform-colors-opacity motion-reduce:transition-none',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    color: 'default',
    fullWidth: false,
    isDisabled: false,
    isInGroup: false,
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'default',
      class: 'bg-default text-default-foreground',
    },
    {
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary text-primary-foreground',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class: 'bg-secondary text-secondary-foreground',
    },
    {
      variant: 'solid',
      color: 'success',
      class: 'bg-success text-white',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'bg-warning text-white',
    },
    {
      variant: 'solid',
      color: 'danger',
      class: 'bg-danger text-danger-foreground',
    },
    {
      variant: 'shadow',
      color: 'default',
      class: 'bg-default text-default-foreground shadow-lg shadow-default/50',
    },
    {
      variant: 'shadow',
      color: 'primary',
      class: 'bg-primary text-primary-foreground shadow-lg shadow-primary/40',
    },
    {
      variant: 'shadow',
      color: 'secondary',
      class:
        'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40',
    },
    {
      variant: 'shadow',
      color: 'success',
      class: 'bg-success text-white shadow-lg shadow-success/40',
    },
    {
      variant: 'shadow',
      color: 'warning',
      class: 'bg-warning text-white shadow-lg shadow-warning/40',
    },
    {
      variant: 'shadow',
      color: 'danger',
      class: 'bg-danger text-danger-foreground shadow-lg shadow-danger/40',
    },
    {
      variant: 'bordered',
      color: 'default',
      class: 'border-default bg-transparent text-foreground',
    },
    {
      variant: 'bordered',
      color: 'primary',
      class: 'border-primary bg-transparent text-primary',
    },
    {
      variant: 'bordered',
      color: 'secondary',
      class: 'border-secondary bg-transparent text-secondary',
    },
    {
      variant: 'bordered',
      color: 'success',
      class: 'border-success bg-transparent text-success',
    },
    {
      variant: 'bordered',
      color: 'warning',
      class: 'border-warning bg-transparent text-warning',
    },
    {
      variant: 'bordered',
      color: 'danger',
      class: 'border-danger bg-transparent text-danger',
    },
    {
      variant: 'flat',
      color: 'default',
      class: 'bg-default/40 text-default-700',
    },
    {
      variant: 'flat',
      color: 'primary',
      class: 'bg-primary/20 text-primary-600',
    },
    {
      variant: 'flat',
      color: 'secondary',
      class: 'bg-secondary/20 text-secondary-600',
    },
    {
      variant: 'flat',
      color: 'success',
      class: 'bg-success/20 text-success-700 dark:text-success',
    },
    {
      variant: 'flat',
      color: 'warning',
      class: 'bg-warning/20 text-warning-700 dark:text-warning',
    },
    {
      variant: 'flat',
      color: 'danger',
      class: 'bg-danger/20 text-danger-600 dark:text-danger-500',
    },
    {
      variant: 'faded',
      color: 'default',
      class: 'border-default bg-default-100 text-default-foreground',
    },
    {
      variant: 'faded',
      color: 'primary',
      class: 'border-default bg-default-100 text-primary',
    },
    {
      variant: 'faded',
      color: 'secondary',
      class: 'border-default bg-default-100 text-secondary',
    },
    {
      variant: 'faded',
      color: 'success',
      class: 'border-default bg-default-100 text-success',
    },
    {
      variant: 'faded',
      color: 'warning',
      class: 'border-default bg-default-100 text-warning',
    },
    {
      variant: 'faded',
      color: 'danger',
      class: 'border-default bg-default-100 text-danger',
    },
    {
      variant: 'light',
      color: 'default',
      class: [
        'bg-transparent text-default-foreground',
        'data-[hover=true]:bg-default/40',
      ],
    },
    {
      variant: 'light',
      color: 'primary',
      class: ['bg-transparent text-primary', 'data-[hover=true]:bg-primary/20'],
    },
    {
      variant: 'light',
      color: 'secondary',
      class: [
        'bg-transparent text-secondary',
        'data-[hover=true]:bg-secondary/20',
      ],
    },
    {
      variant: 'light',
      color: 'success',
      class: ['bg-transparent text-success', 'data-[hover=true]:bg-success/20'],
    },
    {
      variant: 'light',
      color: 'warning',
      class: ['bg-transparent text-warning', 'data-[hover=true]:bg-warning/20'],
    },
    {
      variant: 'light',
      color: 'danger',
      class: ['bg-transparent text-danger', 'data-[hover=true]:bg-danger/20'],
    },
    {
      variant: 'ghost',
      color: 'default',
      class: [
        'border-default text-default-foreground',
        'data-[hover=true]:!bg-default',
      ],
    },
    {
      variant: 'ghost',
      color: 'primary',
      class: [
        'border-primary text-primary',
        'data-[hover=true]:!bg-primary data-[hover=true]:!text-primary-foreground',
      ],
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class: [
        'border-secondary text-secondary',
        'data-[hover=true]:!bg-secondary data-[hover=true]:!text-secondary-foreground',
      ],
    },
    {
      variant: 'ghost',
      color: 'success',
      class: [
        'border-success text-success',
        'data-[hover=true]:!bg-success data-[hover=true]:!text-success-foreground',
      ],
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: [
        'border-warning text-warning',
        'data-[hover=true]:!bg-warning data-[hover=true]:!text-warning-foreground',
      ],
    },
    {
      variant: 'ghost',
      color: 'danger',
      class: [
        'border-danger text-danger',
        'data-[hover=true]:!bg-danger data-[hover=true]:!text-danger-foreground',
      ],
    },
    {
      isInGroup: true,
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      size: 'sm',
      class: 'rounded-none first:rounded-s-small last:rounded-e-small',
    },
    {
      isInGroup: true,
      size: 'md',
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      size: 'lg',
      class: 'rounded-none first:rounded-s-large last:rounded-e-large',
    },
    {
      isInGroup: true,
      radius: 'none',
      class: 'rounded-none first:rounded-s-none last:rounded-e-none',
    },
    {
      isInGroup: true,
      radius: 'sm',
      class: 'rounded-none first:rounded-s-small last:rounded-e-small',
    },
    {
      isInGroup: true,
      radius: 'md',
      class: 'rounded-none first:rounded-s-medium last:rounded-e-medium',
    },
    {
      isInGroup: true,
      radius: 'lg',
      class: 'rounded-none first:rounded-s-large last:rounded-e-large',
    },
    {
      isInGroup: true,
      radius: 'full',
      class: 'rounded-none first:rounded-s-full last:rounded-e-full',
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'default',
      className: [
        '[&+.border-medium.border-default]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'primary',
      className: [
        '[&+.border-medium.border-primary]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'secondary',
      className: [
        '[&+.border-medium.border-secondary]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'success',
      className: [
        '[&+.border-medium.border-success]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'warning',
      className: [
        '[&+.border-medium.border-warning]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isInGroup: true,
      variant: ['ghost', 'bordered'],
      color: 'danger',
      className: [
        '[&+.border-medium.border-danger]:ms-[calc(var(--pixel-border-width-medium)*-1)]',
      ],
    },
    {
      isIconOnly: true,
      size: 'sm',
      class: 'h-8 w-8 min-w-8',
    },
    {
      isIconOnly: true,
      size: 'md',
      class: 'h-10 w-10 min-w-10',
    },
    {
      isIconOnly: true,
      size: 'lg',
      class: 'h-12 w-12 min-w-12',
    },
    {
      variant: ['solid', 'faded', 'flat', 'bordered', 'shadow'],
      class: 'data-[hover=true]:opacity-hover',
    },
    {
      color: 'info',
      variant: 'solid',
      class: 'bg-info text-info-foreground',
    },
    {
      color: 'info',
      variant: 'shadow',
      class: 'shadow-info/40 bg-info text-info-foreground shadow-lg',
    },
    {
      color: 'info',
      variant: 'bordered',
      class: 'border-medium border-info bg-transparent text-info',
    },
    {
      color: 'info',
      variant: 'flat',
      class: 'bg-info/20 text-info-600',
    },
    {
      color: 'info',
      variant: 'faded',
      class: 'border-default bg-default-100 text-info',
    },
    {
      color: 'info',
      variant: 'light',
      class: 'bg-transparent text-info data-[hover=true]:bg-info-100',
    },
    {
      color: 'info',
      variant: 'ghost',
      class:
        'border-info text-info data-[hover=true]:!bg-info data-[hover=true]:!text-info-foreground',
    },
  ],
});

export type VariantProps = TVProps<typeof buttonVariants>;

export default buttonVariants;
