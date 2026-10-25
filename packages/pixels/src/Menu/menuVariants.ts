import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Menu surface, sections, options and trigger styling */
export const menuVariants = tv({
  slots: {
    /** Secondary information below an option label */
    description:
      'w-full truncate text-foreground-500 text-tiny group-hover:text-current',
    /** Text identifying a group of actions */
    heading: ['mb-1 block pl-1 text-foreground-500 text-tiny', 'leading-5'],
    /** Action row containing its icon and text */
    item: [
      'group relative box-border flex h-full w-full cursor-pointer items-center justify-between gap-2 rounded-small px-2 py-1.5 subpixel-antialiased',
      // focus and hover feedback
      'outline-solid outline-transparent data-[focus-visible]:z-10 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-focus',
      'data-[focused]:bg-default data-[hovered]:bg-default data-[focused]:text-default-foreground data-[hovered]:text-default-foreground data-[hovered]:transition-colors',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
    ],
    /** Text identifying an action */
    label: 'w-full flex-1 truncate font-normal text-small',
    /** Stack containing an option label and description */
    labelWrapper: 'flex w-full min-w-0 flex-col items-start justify-center',
    /** Keyboard navigable list of menu options */
    list: 'outline-solid flex w-full flex-col gap-0.5 outline-transparent',
    /** Padded container around the action list */
    menu: 'relative flex w-full flex-col gap-1 overflow-clip p-1',
    /** Floating rounded surface around the menu */
    panel:
      'relative z-10 box-border flex w-full min-w-[200px] flex-col items-center justify-center rounded-large bg-content1 p-1 subpixel-antialiased shadow-medium outline-none text-small',
    /** Group of related actions */
    section: 'relative mb-2',
    /** Button that opens the menu */
    trigger:
      'z-auto subpixel-antialiased aria-expanded:!scale-[0.97] aria-expanded:!opacity-70',
  },
});

export type VariantProps = TVProps<typeof menuVariants>;

export type ClassName = TVClassName<typeof menuVariants>;

export type MenuClassNames = Record<
  keyof ReturnType<typeof menuVariants>,
  string
>;

export default menuVariants;
