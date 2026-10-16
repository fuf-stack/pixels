import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Default styles for all public Input slots */
export const inputVariants = tv({
  slots: {
    /** Container grouping the label, control and hints */
    base: 'group relative flex w-full flex-col',
    /** Button for clearing the current value */
    clearButton:
      'absolute end-3 z-10 -m-2 cursor-pointer rounded-full p-2 opacity-70 outline-none text-large hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus',
    /** Supporting text below the input */
    description: 'text-foreground-500 text-tiny',
    /** Container for validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Container for help text and validation messages */
    helperWrapper: 'relative flex flex-col p-0',
    /** Row containing the input, addons and actions */
    innerWrapper: 'inline-flex h-full w-full items-center gap-0',
    /** Native input for text or numeric entry */
    input:
      'w-full min-w-0 bg-transparent bg-clip-text font-normal text-inherit outline-none text-small placeholder:text-foreground-500 autofill:bg-transparent data-[has-end-content=true]:pe-1.5 data-[has-start-content=true]:ps-1.5 dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] [&::-ms-reveal]:hidden',
    /** Bordered container around the editable area */
    inputWrapper:
      'shadow-xs relative inline-flex h-10 min-h-10 w-full cursor-text items-center rounded-small border-medium border-default-200 bg-content1 px-3 text-foreground transition-colors data-[hovered=true]:border-default-400 group-data-[disabled=true]:pointer-events-none group-data-[focus=true]:border-focus group-data-[invalid=true]:border-danger group-data-[focus=true]:data-[hovered=true]:border-default-foreground motion-reduce:transition-none',
    /** Label above the input */
    label:
      'block cursor-default pb-1 text-foreground text-small group-data-[invalid=true]:text-danger',
    /** Container grouping increment and decrement buttons */
    stepper: 'flex h-full flex-col justify-center ps-1',
    /** Buttons for increasing or decreasing the numeric value */
    stepperButton:
      'flex h-3 w-3 items-center justify-center text-default-foreground outline-none hover:opacity-hover focus-visible:outline-2 focus-visible:outline-focus',
  },
  variants: {
    filled: {
      true: {
        base: 'is-filled',
        input: 'is-filled',
        inputWrapper: 'is-filled',
      },
    },
    number: { true: { clearButton: 'relative' } },
    clearable: { true: { input: 'pe-6' } },
    size: {
      lg: {
        input: 'text-medium',
        inputWrapper: 'h-12 min-h-12',
        label: 'text-medium',
      },
      md: {},
      sm: {
        clearButton: 'text-medium',
        input: 'text-small',
        inputWrapper: 'h-8 min-h-8 px-2',
        label: 'text-tiny',
      },
    },
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    invalid: {
      true: {
        input: 'text-danger',
        inputWrapper:
          'border-danger data-[hovered=true]:border-danger group-data-[focus=true]:border-danger group-data-[focus=true]:data-[hovered=true]:border-danger',
        label: 'text-danger',
      },
    },
  },
});

/** Variant options for the input styling slots */
export type VariantProps = TVProps<typeof inputVariants>;

/** Class name overrides for the public Input styling slots. */
export type ClassName = TVClassName<typeof inputVariants>;

/** Resolved class names for every Input styling slot. */
export type InputClassNames = Record<
  keyof ReturnType<typeof inputVariants>,
  string
>;

export default inputVariants;
