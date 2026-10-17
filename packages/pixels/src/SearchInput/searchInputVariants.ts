import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Search surface, editable text and clear action styles */
export const inputVariants = tv({
  slots: {
    /** Container around the search control */
    base: 'group relative flex w-full flex-col justify-end',
    /** Action for clearing the search text */
    clearButton: [
      // placement and hit target
      'pointer-events-none absolute end-3 start-auto z-10 -m-2 rounded-full p-2',
      // appearance and keyboard focus
      'outline-solid cursor-pointer select-none appearance-none outline-transparent text-large data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // visibility follows the adjacent input's value
      'scale-90 opacity-0 peer-data-[filled=true]:pointer-events-auto peer-data-[filled=true]:block peer-data-[filled=true]:scale-100 peer-data-[filled=true]:opacity-70',
      // pointer feedback and transitions
      'transition-[opacity,transform] duration-150 ease-out hover:!opacity-100 active:!opacity-70 motion-reduce:scale-100 motion-reduce:transition-none',
    ],
    /** Row containing the input, icon and clear action */
    innerWrapper: 'box-border inline-flex h-full w-full items-center',
    /** Editable search text */
    input: [
      // editable text and transparent surface
      'peer w-full bg-transparent bg-clip-text pe-6 font-normal text-small',
      // focus and placeholder appearance
      '!outline-solid focus-visible:outline-solid outline-transparent placeholder:text-foreground-500',
      // spacing around surrounding content
      'data-[has-end-content=true]:pe-1.5 data-[has-start-content=true]:ps-1.5',
      // browser-specific input appearance
      'input-search-cancel-button-none file:cursor-pointer file:border-0 file:bg-transparent autofill:bg-transparent data-[type=color]:rounded-none dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] [&::-ms-reveal]:hidden',
    ],
    /** Bordered surface around the search controls */
    inputWrapper: [
      // surface dimensions and layout
      'shadow-xs relative inline-flex h-10 min-h-10 w-full cursor-text flex-row items-center gap-3 px-3 tap-highlight-transparent',
      // border and background
      'rounded-small border-medium border-default-200 bg-content1',
      // hover, focus and transitions
      'transition-colors !duration-150 data-[hover=true]:border-default-400 group-data-[focus=true]:border-focus group-data-[focus=true]:data-[hover=true]:border-default-foreground motion-reduce:transition-none',
    ],
    /** Container sizing the search surface */
    mainWrapper: 'flex h-full flex-col',
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
    size: {
      sm: {
        clearButton: 'text-medium',
        input: 'text-small',
        inputWrapper: 'h-8 min-h-8 px-2',
      },
      md: {},
      lg: { input: 'text-medium', inputWrapper: 'h-12 min-h-12' },
    },
  },
});

export type VariantProps = TVProps<typeof inputVariants>;

export type ClassName = TVClassName<typeof inputVariants>;

export default inputVariants;
