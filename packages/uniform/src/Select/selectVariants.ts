import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../partials/FieldHelper/fieldHelperVariants';
import { fieldLabelVariants } from '../partials/FieldLabel/fieldLabelVariants';

export const selectVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    base: [
      // Enables group-data selectors used by child slots.
      'group',
      // Make field wrappers align with other form controls.
      'flex w-full flex-col',
      // Preserve existing text flow for select content.
      'leading-normal',
    ],
    clearIndicator:
      'rounded-md p-1 text-foreground-500 hover:cursor-pointer hover:bg-default-200 hover:text-foreground-800',
    control: [
      // control surface and transition
      'duration-150! min-h-10 rounded-lg border-2 border-default-200 bg-content1 transition-background',
      // hover and validation borders
      'hover:border-default-400 group-data-[invalid=true]:border-danger group-data-[invalid=true]:hover:border-danger',
      // reduced motion
      'motion-reduce:transition-none',
    ],
    control_focused: 'border-focus',
    crossIcon: '',
    downChevron: '',
    dropdownIndicator:
      'rounded-md p-1 text-foreground-500 hover:cursor-pointer hover:bg-default-200 hover:text-black',
    group: '',
    groupHeading: 'mb-1 ml-3 mt-2 text-sm text-foreground-500',
    indicatorSeparator: 'bg-default-300',
    indicatorsContainer: 'gap-1 p-1',
    input: 'py-0.5 pl-1',
    label: [fieldLabelVariants.base, 'pointer-events-auto inline-flex'],
    loadingIndicator: '',
    loadingMessage: 'rounded-sm p-2 text-foreground-500',
    menu: 'mt-2 rounded-xl border border-default-200 bg-content1 p-1 shadow-lg',
    menuList: '',
    // ensure menu has same z-index as modal so it is visible when rendered in modal
    menuPortal: 'z-50!',
    multiValue: 'h-6 items-center gap-1.5 rounded bg-default-100 pl-2 pr-1',
    multiValueContainer: '',
    multiValueLabel: 'py-0 leading-5',
    multiValueRemove: [
      // remove button layout and appearance
      'flex h-5 w-5 items-center justify-center rounded text-default-500',
      // hover feedback
      'hover:cursor-pointer hover:border-default-300 hover:text-default-800',
    ],
    noOptionsMessage: 'rounded-sm p-2 text-foreground-500',
    option: 'rounded px-3 py-2 hover:cursor-pointer',
    option_disabled:
      'cursor-not-allowed! hover:cursor-not-allowed! opacity-disabled',
    option_focused: 'bg-default-100 active:bg-default-200',
    option_selected: 'bg-default-300',
    placeholder: 'ml-1 py-0.5 pl-1 text-sm text-foreground-500',
    selectContainer: '',
    selectedValue: 'w-full truncate text-start font-normal text-small',
    singleValue: 'ml-1! leading-7!',
    valueContainer: 'gap-1 p-1',
  },
  variants: {
    disabled: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed',
        // drop hover feedback on the locked control and its actions
        clearIndicator:
          'hover:cursor-not-allowed hover:bg-transparent hover:text-foreground-500',
        control: 'hover:border-default-200',
        dropdownIndicator:
          'hover:cursor-not-allowed hover:bg-transparent hover:text-foreground-500',
      },
    },
    invalid: { true: { selectedValue: 'text-danger!' } },
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed',
        // drop hover feedback on the locked control and its actions
        clearIndicator:
          'hover:cursor-not-allowed hover:bg-transparent hover:text-foreground-500',
        control: 'hover:border-default-200',
        dropdownIndicator:
          'hover:cursor-not-allowed hover:bg-transparent hover:text-foreground-500',
      },
    },
  },
});

export type VariantProps = TVProps<typeof selectVariants>;

export type ClassName = TVClassName<typeof selectVariants>;

export type SelectClassNames = Record<
  keyof ReturnType<typeof selectVariants>,
  string
>;
