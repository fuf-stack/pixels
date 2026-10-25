import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Avatar image, fallback and optional border ring */
export const avatarVariants = tv({
  slots: {
    /** Surface framing the image or fallback */
    base: [
      // centered content and clipping
      'relative z-0 box-border flex items-center justify-center overflow-hidden bg-default align-middle text-default-foreground',
      // keyboard focus when focused programmatically
      'outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
    ],
    /** Custom content shown while the image is unavailable */
    fallback:
      'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center',
    /** Placeholder person icon */
    icon: 'absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center text-inherit',
    /** Image fading in after loading */
    img: [
      'flex h-full w-full object-cover',
      'opacity-0 transition-opacity !duration-500 data-[loaded=true]:opacity-100 motion-reduce:transition-none',
    ],
    /** Text used by the group overflow count */
    name: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-normal text-inherit',
  },
  variants: {
    bordered: {
      true: {
        base: 'dark:ring-offset-background-dark ring-2 ring-default ring-offset-2 ring-offset-background',
      },
    },
    disabled: { true: { base: 'opacity-disabled' } },
    grouped: {
      true: {
        base: [
          '-ms-2 transition-transform motion-reduce:transition-none',
          'data-[hover=true]:-translate-x-3 rtl:data-[hover=true]:translate-x-3',
          'data-[focus-visible=true]:-translate-x-3 rtl:data-[focus-visible=true]:translate-x-3',
        ],
      },
    },
    rounded: {
      none: { base: 'rounded-none' },
      sm: { base: 'rounded-small' },
      md: { base: 'rounded-medium' },
      lg: { base: 'rounded-large' },
      full: { base: 'rounded-full' },
    },
    size: {
      sm: { base: 'h-8 w-8 text-tiny' },
      md: { base: 'h-10 w-10 text-tiny' },
      lg: { base: 'h-14 w-14 text-small' },
    },
  },
  defaultVariants: { rounded: 'full', size: 'md' },
});

export type VariantProps = TVProps<typeof avatarVariants>;

export type ClassName = TVClassName<typeof avatarVariants>;

export type AvatarClassNames = Record<
  keyof ReturnType<typeof avatarVariants>,
  string
>;

export default avatarVariants;
