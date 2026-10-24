import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Default styles for all public Input slots */
export const inputVariants = tv({
  slots: {
    /** Container grouping the label, control and hints */
    base: 'group relative flex w-full flex-col',
    /** Button for clearing the current value */
    clearButton: [
      // clear button placement and appearance
      'absolute end-3 z-10 -m-2 cursor-pointer rounded-full p-2 text-large opacity-70 outline-none',
      // hover and keyboard focus
      'hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus',
    ],
    /** Supporting text below the input */
    description: 'text-tiny text-foreground-500',
    /** Container for validation messages */
    errorMessage: 'text-tiny text-danger',
    /** Container for help text and validation messages */
    helperWrapper: 'relative flex flex-col p-0',
    /** Row containing the input, addons and actions */
    innerWrapper: 'inline-flex h-full w-full items-center gap-0',
    /** Native input for text or numeric entry */
    input: [
      // editable text and transparent surface
      'w-full min-w-0 bg-transparent bg-clip-text text-small font-normal text-inherit outline-none',
      // placeholder and autofill
      'placeholder:text-foreground-500 autofill:bg-transparent',
      // spacing around surrounding content
      'data-[has-end-content=true]:pe-1.5 data-[has-start-content=true]:ps-1.5',
      // browser-specific input appearance
      'dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] [&::-ms-reveal]:hidden',
    ],
    /** Bordered container around the editable area */
    inputWrapper: [
      // input frame and layout
      'relative inline-flex h-10 min-h-10 w-full cursor-text items-center shadow-xs',
      // bordered surface and text
      'rounded-small border-medium border-default-200 bg-content1 px-3 text-foreground',
      // interaction transitions
      'transition-colors',
      // hover, disabled and validation states
      'group-data-[disabled=true]:pointer-events-none group-data-[focus=true]:border-focus group-data-[invalid=true]:border-danger data-[hovered=true]:border-default-400 group-data-[focus=true]:data-[hovered=true]:border-default-foreground',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Label above the input */
    label:
      'block cursor-default pb-1 text-small text-foreground group-data-[invalid=true]:text-danger',
    /** Button for revealing or masking a password */
    passwordToggle:
      'shrink-0 rounded-sm p-1 text-default-400 outline-none focus-visible:ring-2 focus-visible:ring-focus',
    /** Container grouping increment and decrement buttons */
    stepper: 'flex h-full flex-col justify-center ps-1',
    /** Buttons for increasing or decreasing the numeric value */
    stepperButton: [
      // stepper button dimensions and appearance
      'flex h-3 w-3 items-center justify-center text-default-foreground outline-none',
      // hover and keyboard focus
      'hover:opacity-hover focus-visible:outline-2 focus-visible:outline-focus',
    ],
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
    password: {
      true: { clearButton: 'relative end-auto m-0 p-1', innerWrapper: 'gap-2' },
    },
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
          'border-danger group-data-[focus=true]:border-danger data-[hovered=true]:border-danger group-data-[focus=true]:data-[hovered=true]:border-danger',
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
