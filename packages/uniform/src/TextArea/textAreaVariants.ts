import { tv } from '@fuf-stack/pixel-utils';

/** Owned defaults for the existing public textarea slots. */
const textAreaVariants = tv({
  slots: {
    base: 'group relative flex w-full flex-col',
    clearButton: '',
    inputWrapper:
      'shadow-xs relative inline-flex w-full cursor-text items-start rounded-medium border-medium border-default-200 bg-content1 px-3 py-2 text-foreground transition-colors data-[hover=true]:border-default-400 group-data-[focus=true]:border-focus group-data-[focus=true]:data-[hover=true]:border-default-foreground motion-reduce:transition-none',
    input:
      'w-full min-w-0 resize-none bg-transparent bg-clip-text font-normal text-inherit outline-none duration-100 transition-height text-small placeholder:text-foreground-500 autofill:bg-transparent data-[hide-scroll=true]:[scrollbar-width:none] motion-reduce:transition-none dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] data-[hide-scroll=true]:[&::-webkit-scrollbar]:hidden',
  },
});

export const textAreaStateVariants = tv({
  extend: textAreaVariants,
  slots: {
    innerWrapper: 'inline-flex w-full items-start',
    label: 'block pb-1.5 text-foreground text-small',
    helperWrapper: 'relative flex flex-col p-0',
    description: 'text-foreground-500 text-tiny',
    errorMessage: 'text-danger text-tiny',
  },
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
