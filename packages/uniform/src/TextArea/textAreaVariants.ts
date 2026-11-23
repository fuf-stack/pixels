import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../partials/FieldHelper/fieldHelperVariants';
import { fieldLabelVariants } from '../partials/FieldLabel/fieldLabelVariants';

/** Textarea slot styles with disabled, filled and invalid states */
export const textAreaVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    /** Container for the label, input and messages */
    base: 'group relative flex w-full flex-col',
    /** Reserved clear action slot */
    clearButton: '',
    /** Container around the autosizing textarea */
    innerWrapper: 'inline-flex w-full items-start',
    /** Editable multiline text */
    input: [
      // editable text and transparent surface
      'w-full min-w-0 resize-none bg-transparent bg-clip-text font-normal text-inherit outline-none',
      // autosize transition
      'text-small transition-height duration-100',
      // placeholder and autofill
      'placeholder:text-foreground-500 autofill:bg-transparent',
      // scrollbar visibility and reduced motion
      'data-[hide-scroll=true]:[scrollbar-width:none] motion-reduce:transition-none',
      // browser-specific textarea appearance
      'dark:autofill:[-webkit-text-fill-color:var(--pixel-color-foreground)] data-[hide-scroll=true]:[&::-webkit-scrollbar]:hidden',
    ],
    /** Bordered surface around the textarea */
    inputWrapper: [
      // textarea frame and layout
      'relative inline-flex w-full cursor-text items-start shadow-xs',
      // bordered surface and text
      'rounded-medium border-medium border-default-200 bg-content1 px-3 py-2 text-foreground',
      // interaction transitions
      'transition-colors',
      // hover and focus borders
      'group-data-[focus=true]:border-focus data-[hover=true]:border-default-400 group-data-[focus=true]:data-[hover=true]:border-default-foreground',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Label above the textarea */
    label: [fieldLabelVariants.base, 'block'],
  },
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed',
      },
    },
    filled: {
      true: {
        base: 'is-filled',
        input: 'is-filled',
        inputWrapper: 'is-filled',
      },
    },
    invalid: {
      true: {
        input: 'text-danger placeholder:text-danger',
        inputWrapper:
          'border-danger group-data-[focus=true]:border-danger data-[hover=true]:border-danger group-data-[focus=true]:data-[hover=true]:border-danger',
        label: 'text-danger',
      },
    },
  },
});

export type VariantProps = TVProps<typeof textAreaVariants>;

export type ClassName = TVClassName<typeof textAreaVariants>;

/** Resolved class names for the multiline input slots */
export type TextAreaClassNames = Record<
  keyof ReturnType<typeof textAreaVariants>,
  string
>;

export default textAreaVariants;
