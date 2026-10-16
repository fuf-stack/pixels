import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Owned defaults for the existing public textarea slots. */
const textAreaVariants = tv({
  slots: {
    /** Container for the label, input and messages */
    base: 'group relative flex w-full flex-col',
    /** Reserved clear action slot */
    clearButton: '',
    /** Bordered surface around the textarea */
    inputWrapper:
      'shadow-xs relative inline-flex w-full cursor-text items-start rounded-medium border-medium border-default-200 bg-content1 px-3 py-2 text-foreground transition-colors data-[hover=true]:border-default-400 group-data-[focus=true]:border-focus group-data-[focus=true]:data-[hover=true]:border-default-foreground motion-reduce:transition-none',
    /** Editable multiline text */
    input:
      'w-full min-w-0 resize-none bg-transparent bg-clip-text font-normal text-inherit outline-none duration-100 transition-height text-small placeholder:text-foreground-500 autofill:bg-transparent data-[hide-scroll=true]:[scrollbar-width:none] motion-reduce:transition-none dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] data-[hide-scroll=true]:[&::-webkit-scrollbar]:hidden',
    /** Container around the autosizing textarea */
    innerWrapper: 'inline-flex w-full items-start',
    /** Label above the textarea */
    label: 'block pb-1.5 text-foreground text-small',
    /** Container for help text and validation messages */
    helperWrapper: 'relative flex flex-col p-0',
    /** Supporting text below the textarea */
    description: 'text-foreground-500 text-tiny',
    /** Validation message container */
    errorMessage: 'text-danger text-tiny',
  },
});

export type VariantProps = TVProps<typeof textAreaVariants>;
export type ClassName = TVClassName<typeof textAreaVariants>;

export const textAreaStateVariants = tv({
  extend: textAreaVariants,
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    filled: {
      true: {
        base: 'is-filled',
        input: 'is-filled',
        inputWrapper: 'is-filled',
      },
    },
    invalid: {
      true: {
        label: 'text-danger',
        input: 'text-danger placeholder:text-danger',
        inputWrapper:
          'border-danger data-[hover=true]:border-danger group-data-[focus=true]:border-danger group-data-[focus=true]:data-[hover=true]:border-danger',
      },
    },
  },
});

export default textAreaVariants;
