import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

const radioControlVariants = tv({
  slots: {
    /** Clickable option containing the indicator and label */
    base: [
      // option layout and pointer behavior
      'group relative -m-2 inline-flex max-w-fit cursor-pointer select-none items-center justify-start p-2 tap-highlight-transparent',
      // disabled interaction and opacity
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled',
    ],
    /** Dot marking the selected option */
    control: [
      // selection dot appearance and animation
      'z-10 h-2 w-2 origin-center scale-0 rounded-full bg-primary text-primary-foreground opacity-0 transition-transform-opacity',
      // selection and validation states
      'group-data-[selected=true]:scale-100 group-data-[invalid=true]:bg-danger group-data-[invalid=true]:text-danger-foreground group-data-[selected=true]:opacity-100',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    /** Supporting text below the option label */
    description:
      'relative text-foreground-400 transition-colors text-small motion-reduce:transition-none',
    /** Option state boundary without an additional layout box */
    field: 'contents',
    /** Container for a decorative option icon */
    icon: '',
    /** Primary option text */
    label:
      'relative select-none text-foreground transition-colors text-medium motion-reduce:transition-none',
    /** Container grouping the option label and description */
    labelWrapper: 'ml-1 ms-2 flex flex-col',
    /** Circular outline around the selection indicator */
    wrapper: [
      // indicator dimensions and layout
      'relative box-border inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden',
      // circular border and transitions
      'rounded-full border-2 border-solid border-default transition-transform-colors',
      // pressed, selected and invalid states
      'group-data-[pressed=true]:scale-95 group-data-[invalid=true]:border-danger group-data-[invalid=true]:group-data-[selected=true]:border-danger group-data-[selected=true]:border-primary group-data-[hover-unselected=true]:bg-default-100',
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
