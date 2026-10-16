import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Shared segmented input defaults, also extended by DatePicker */
export const segmentedInputVariants = tv({
  slots: {
    /** Field container with space for supporting text */
    base: 'group flex w-full flex-col gap-y-1.5 pb-5',
    /** Field description text */
    description: 'text-foreground-500 text-tiny',
    /** Validation message text */
    errorMessage: 'text-danger text-tiny',
    /** Supporting text below the input surface */
    helperWrapper: [
      'absolute start-0 top-[calc(100%_+_2px)] flex flex-col gap-1.5',
      'p-0',
    ],
    /** Row containing segments and optional controls */
    innerWrapper: 'flex h-6 w-full items-center gap-x-2 text-default-400',
    /** Editable date or time segment group */
    input: 'flex h-full w-full gap-x-0.5 font-normal text-small',
    /** Bordered surface around the editable segments */
    inputWrapper: [
      'shadow-xs relative inline-flex h-10 min-h-10 w-full cursor-text flex-row items-center gap-3 rounded-small border-2 border-default-200 px-3 transition-colors duration-150 hover:border-default-400 focus-within:hover:border-default-foreground motion-reduce:transition-none',
      'bg-content1 focus-within:border-focus',
    ],
    /** Label above the segmented input */
    label: [
      'block w-full text-foreground subpixel-antialiased text-small',
      'cursor-default',
    ],
    /** Individual editable value or separator */
    segment:
      'outline-solid focus:shadow-xs group my-auto box-content inline-block rounded-md px-0.5 text-start tabular-nums text-foreground-500 outline-transparent transition-colors first:-ml-0.5 focus:bg-default-400/50 data-[editable=true]:data-[placeholder=true]:text-foreground-500 data-[editable=true]:text-foreground data-[editable=true]:focus:text-default-foreground motion-reduce:transition-none [&:not(:first-child)]:-ml-1',
  },
});
export type VariantProps = Omit<
  TVProps<typeof timeVariants>,
  'disabled' | 'invalid'
>;
export type ClassName = TVClassName<typeof timeVariants>;
export const timeVariants = tv({
  extend: segmentedInputVariants,
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    invalid: {
      true: {
        innerWrapper: 'text-danger',
        inputWrapper:
          'border-danger focus-within:border-danger hover:border-danger focus-within:hover:border-danger',
        label: 'text-danger',
        segment:
          'text-danger-300 focus:bg-danger-400/50 data-[editable=true]:data-[placeholder=true]:text-danger data-[editable=true]:text-danger data-[editable=true]:focus:text-danger dark:focus:bg-danger-400/20',
      },
    },
  },
});
