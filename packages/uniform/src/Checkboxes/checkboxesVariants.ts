import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

const checkboxColorVariants = tv({
  slots: { wrapper: '' },
  variants: {
    color: {
      danger: {
        wrapper:
          'text-danger-foreground after:bg-danger after:text-danger-foreground',
      },
      default: {
        wrapper:
          'text-default-foreground after:bg-default after:text-default-foreground',
      },
      info: {
        wrapper:
          'text-info-foreground after:bg-info after:text-info-foreground',
      },
      primary: {
        wrapper:
          'text-primary-foreground after:bg-primary after:text-primary-foreground',
      },
      secondary: {
        wrapper:
          'text-secondary-foreground after:bg-secondary after:text-secondary-foreground',
      },
      success: {
        wrapper:
          'text-success-foreground after:bg-success after:text-success-foreground',
      },
      warning: {
        wrapper:
          'text-warning-foreground after:bg-warning after:text-warning-foreground',
      },
    },
  },
});
export const checkboxesVariants = tv({
  extend: checkboxColorVariants,
  slots: {
    /** Container for the field control and supporting text */
    base: ['group flex w-full flex-col gap-y-1.5', 'relative'],
    /** Supporting text for the field */
    description: 'text-foreground-400 text-small',
    /** Container for validation messages */
    errorMessage: ['text-tiny', 'text-danger text-small'],
    /** Container for help text and validation messages */
    helperWrapper: 'relative block p-0',
    /** Visible field label */
    label: [
      'inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
      'relative',
    ],
    /** Clickable checkbox option */
    optionBase: [
      '',
      // option layout and pointer behavior
      'group relative -m-2 inline-flex max-w-fit cursor-pointer select-none items-center justify-start p-2 tap-highlight-transparent',
      // disabled interaction and opacity
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled',
    ],
    /** Checkmark inside the selection indicator */
    optionIcon: [
      '',
      // checkmark dimensions and fade transition
      'pointer-events-none z-10 h-3 w-4 opacity-0 transition-opacity',
      // selected visibility
      'group-data-[selected=true]:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Primary option text */
    optionLabel: '',
    /** Additional text below the option label */
    optionLabelSubline: 'text-foreground-400 !text-small',
    /** Outline and fill around the checkmark */
    optionWrapper: [
      '',
      // checkbox dimensions and layout
      'relative me-2 inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--pixel-radius-medium)*0.6)] transition-transform',
      // unselected border layer
      "before:absolute before:inset-0 before:box-border before:rounded-[inherit] before:border-2 before:border-solid before:border-default before:transition-colors before:content-['']",
      // animated selection layer
      "after:absolute after:inset-0 after:origin-center after:scale-50 after:rounded-[inherit] after:opacity-0 after:duration-200 after:ease-linear after:content-[''] after:transition-transform-opacity",
      // pressed scale
      'group-data-[pressed=true]:scale-95',
      // keyboard focus ring
      'group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background',
      // hover and selected states
      'group-data-[hover=true]:before:bg-default-100 group-data-[selected=true]:after:scale-100 group-data-[selected=true]:after:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Container arranging the selectable content */
    wrapper: [
      '',
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
    ],
  },
  variants: {
    lineThrough: {
      true: {
        optionLabel: [
          // label layout
          'inline-flex items-center justify-center',
          // strikethrough line
          "before:absolute before:h-0.5 before:w-0 before:bg-foreground before:content-['']",
          // selected strikethrough state
          'group-data-[selected=true]:opacity-60 group-data-[selected=true]:before:w-full',
          'relative before:transition-all before:duration-200',
        ],
        optionLabelSubline: 'group-data-[selected=true]:opacity-60',
      },
    },
    invalid: {
      true: {
        optionLabel: 'text-danger',
        optionWrapper: 'before:border-danger',
      },
    },
  },
});

export type VariantProps = TVProps<typeof checkboxesVariants>;

export type ClassName = TVClassName<typeof checkboxesVariants>;
export const checkboxOptionVariants = tv({
  extend: checkboxColorVariants,
  slots: {
    /** Option field context without an additional layout box */
    field: 'contents',
    /** Container for the option label and optional subline */
    label:
      'relative select-none text-foreground transition-colors-opacity text-medium before:transition-width motion-reduce:transition-none',
  },
  variants: { invalid: { true: { label: 'text-danger' } } },
});

/** Resolved checkbox group and option slot classes */
export type CheckboxClassNames = Record<
  keyof ReturnType<typeof checkboxesVariants>,
  string
>;
