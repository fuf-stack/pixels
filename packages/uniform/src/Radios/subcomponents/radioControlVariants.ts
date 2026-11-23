import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

const radioControlVariants = tv({
  slots: {
    /** Clickable option containing the indicator and label */
    base: [
      // option layout and pointer behavior
      'group relative -m-2 inline-flex max-w-fit cursor-pointer items-center justify-start p-2 select-none tap-highlight-transparent',
      // disabled cursor and opacity, the native input covers the option
      'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-disabled data-[disabled=true]:**:cursor-not-allowed',
    ],
    /** Dot marking the selected option */
    control: [
      // selection dot appearance and animation
      'z-10 h-2 w-2 origin-center scale-0 rounded-full bg-primary text-primary-foreground opacity-0 transition-transform-opacity',
      // selection and validation states
      'group-data-[invalid=true]:bg-danger group-data-[invalid=true]:text-danger-foreground group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Supporting text below the option label */
    description:
      'relative text-small text-foreground-400 transition-colors motion-reduce:transition-none',
    /** Option state boundary without an additional layout box */
    field: 'contents',
    /** Container for a decorative option icon */
    icon: '',
    /** Primary option text */
    label:
      'relative text-medium text-foreground transition-colors select-none motion-reduce:transition-none',
    /** Container grouping the option label and description */
    labelWrapper: 'ms-2 ml-1 flex flex-col',
    /** Circular outline around the selection indicator */
    wrapper: [
      // indicator dimensions and layout
      'relative box-border inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden',
      // circular border and transitions
      'rounded-full border-2 border-solid border-default transition-transform-colors',
      // pressed, selected and invalid states
      'group-data-[hover-unselected=true]:bg-default-100 group-data-[invalid=true]:border-danger group-data-[pressed=true]:scale-95 group-data-[selected=true]:border-primary group-data-[invalid=true]:group-data-[selected=true]:border-danger',
      // keyboard focus ring
      'group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background',
      // reduced motion
      'motion-reduce:transition-none',
    ],
  },
  variants: {
    invalid: {
      true: {
        control: 'bg-danger text-danger-foreground',
        description: 'text-danger-300',
        label: 'text-danger',
        wrapper: 'border-danger group-data-[selected=true]:border-danger',
      },
    },
  },
});

export type RadioControlClassNames = Partial<
  Record<keyof ReturnType<typeof radioControlVariants>, string>
>;

export type ClassName = TVClassName<typeof radioControlVariants>;

export default radioControlVariants;
