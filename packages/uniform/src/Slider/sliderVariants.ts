import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../partials/FieldHelper/fieldHelperVariants';
import { fieldLabelVariants } from '../partials/FieldLabel/fieldLabelVariants';

export const sliderVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    base: [
      // Enables group-data selectors used by slider slots.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
    ],
    endContent: '',
    filler: ['', 'absolute h-full bg-primary'],
    // clears the thumb focus outline below the track row
    helperWrapper: 'pt-2',
    // Field-level invalid styling is supplied by the owning group.
    // the label row carries the spacing to the track
    label: [fieldLabelVariants.base, 'pb-0'],
    labelWrapper: 'flex w-full items-center justify-between pb-1.5',
    mark: '',
    startContent: '',
    step: [
      '',
      // marker positioning
      'absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2',
      // marker surface
      'rounded-full bg-default-300/50',
      // selected range and RTL positioning
      'data-[in-range=true]:bg-background/50 rtl:translate-x-1/2',
    ],
    // Mouse submission can focus an invalid thumb without keyboard focus-visible.
    thumb: [
      'group-data-[invalid=true]:data-[focused=true]:outline-2',
      'group-data-[invalid=true]:data-[focused=true]:outline-focus',
      'group-data-[invalid=true]:data-[focused=true]:outline-offset-2',
      // thumb layout and surface
      'outline-solid top-1/2 flex h-6 w-6 cursor-grab items-center justify-center rounded-full border-0 bg-primary shadow-small outline-transparent ring-transparent',
      // expanded pointer target
      "before:absolute before:h-11 before:w-11 before:rounded-full before:content-['']",
      // inner thumb surface
      "after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow-small after:transition-all after:content-['']",
      // focus and drag stacking
      'data-[focus-visible=true]:z-10 data-[focused=true]:z-10 data-[dragging=true]:cursor-grabbing',
      // keyboard focus outline
      'data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
      // pressed thumb and reduced motion
      'data-[dragging=true]:after:scale-80 motion-reduce:after:transition-none',
    ],
    track: [
      '',
      // track geometry and surface
      'relative my-1.5 flex h-3 w-full rounded-full border-x-[12px] border-x-transparent bg-default-300/50',
      // fill colors at the track ends
      'data-[fill-end=true]:border-e-primary data-[fill-start=true]:border-s-primary',
    ],
    trackWrapper: ['', 'relative flex items-center gap-2'],
    value: ['', 'text-small'],
    visualBase: 'flex w-full flex-col gap-1',
  },
  variants: {
    size: {
      lg: {
        step: 'h-2 w-2',
        thumb: 'h-7 w-7 shadow-none',
        track: 'my-1 h-7 border-x-[14px]',
        value: 'text-medium',
      },
      md: {},
      sm: {
        step: 'data-[in-range=false]:bg-default-200 data-[in-range=true]:bg-primary',
        thumb: 'h-5 w-5 after:h-4 after:w-4',
        track: 'my-2 h-1 border-x-[10px]',
      },
    },
    disabled: {
      true: { thumb: 'cursor-default', visualBase: 'opacity-disabled' },
    },
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed **:cursor-not-allowed',
        visualBase: 'opacity-disabled',
      },
    },
    invalid: {
      true: {
        filler: 'bg-danger',
        thumb: 'bg-danger',
        track:
          'data-[fill-end=true]:border-e-danger data-[fill-start=true]:border-s-danger',
      },
    },
  },
  compoundVariants: [
    {
      class: { step: 'data-[in-range=true]:bg-danger' },
      invalid: true,
      size: 'sm',
    },
  ],
});

export type VariantProps = TVProps<typeof sliderVariants>;

export type ClassName = TVClassName<typeof sliderVariants>;

export type SliderClassNames = Record<
  keyof ReturnType<typeof sliderVariants>,
  string
>;
