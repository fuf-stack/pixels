import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Hierarchy list, current-page styling and collapsed-item indicator */
export const breadcrumbVariants = tv({
  slots: {
    /** Ellipsis representing the collapsed middle items */
    ellipsis: 'text-medium',
    /** Focusable item content and optional leading or trailing elements */
    item: [
      // inline content and focus target
      'flex cursor-pointer items-center gap-1 whitespace-nowrap tap-highlight-transparent',
      // keyboard focus
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // hover and press feedback
      'hover:opacity-hover active:opacity-disabled',
    ],
    /** List entry containing item content and its separator */
    itemBase: 'flex items-center',
    /** Ordered row of hierarchy items */
    list: 'flex list-none flex-wrap',
    /** Navigation landmark around the hierarchy */
    nav: '',
    /** Decorative marker between neighboring items */
    separator: 'px-1 rtl:rotate-180',
  },
  variants: {
    color: {
      foreground: {
        item: 'text-foreground/50',
        separator: 'text-foreground/50',
      },
      primary: {
        item: 'text-primary/80',
        separator: 'text-primary/80',
      },
      secondary: {
        item: 'text-secondary/80',
        separator: 'text-secondary/80',
      },
      success: {
        item: 'text-success/80',
        separator: 'text-success/80',
      },
      warning: {
        item: 'text-warning/80',
        separator: 'text-warning/80',
      },
      danger: {
        item: 'text-danger/80',
        separator: 'text-danger/80',
      },
    },
    current: { true: {} },
    disabled: {
      true: {
        item: 'pointer-events-none opacity-disabled',
        separator: 'opacity-disabled',
      },
    },
    disableAnimation: {
      true: { item: 'transition-none' },
      false: { item: 'transition-opacity motion-reduce:transition-none' },
    },
    radius: {
      none: { list: 'rounded-none' },
      sm: { list: 'rounded-small' },
      md: { list: 'rounded-medium' },
      lg: { list: 'rounded-large' },
      full: { list: 'rounded-full' },
    },
    size: {
      sm: { item: 'text-tiny' },
      md: { item: 'text-small' },
      lg: { item: 'text-medium' },
    },
    underline: {
      none: { item: 'no-underline' },
      hover: {
        item: 'hover:underline',
        itemBase: 'underline-offset-4',
      },
      active: {
        item: 'active:underline',
        itemBase: 'underline-offset-4',
      },
      focus: {
        item: 'focus:underline',
        itemBase: 'underline-offset-4',
      },
      always: {
        item: 'underline',
        itemBase: 'underline-offset-4',
      },
    },
    variant: {
      solid: { list: 'max-w-fit bg-default-100' },
      bordered: {
        list: 'shadow-xs max-w-fit border-medium border-default-200',
      },
      light: {},
    },
  },
  compoundVariants: [
    {
      current: true,
      class: {
        item: 'cursor-default no-underline hover:no-underline hover:opacity-100 focus:no-underline active:no-underline active:opacity-100',
      },
    },
    { color: 'foreground', current: true, class: { item: 'text-foreground' } },
    { color: 'primary', current: true, class: { item: 'text-primary' } },
    { color: 'secondary', current: true, class: { item: 'text-secondary' } },
    { color: 'success', current: true, class: { item: 'text-success' } },
    { color: 'warning', current: true, class: { item: 'text-warning' } },
    { color: 'danger', current: true, class: { item: 'text-danger' } },
    {
      variant: ['solid', 'bordered'],
      size: 'sm',
      class: { list: 'px-2 py-1' },
    },
    {
      variant: ['solid', 'bordered'],
      size: 'md',
      class: { list: 'px-2.5 py-1.5' },
    },
    {
      variant: ['solid', 'bordered'],
      size: 'lg',
      class: { list: 'px-3 py-2' },
    },
  ],
  defaultVariants: {
    color: 'foreground',
    disableAnimation: false,
    radius: 'none',
    size: 'md',
    underline: 'hover',
    variant: 'light',
  },
});

export type VariantProps = TVProps<typeof breadcrumbVariants>;

export type ClassName = TVClassName<typeof breadcrumbVariants>;

export default breadcrumbVariants;
