import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Styling slots for Filter */
export const filterVariants = tv({
  slots: {
    /** Active filter chip */
    activeFilterLabel: 'h-8 cursor-pointer rounded-md dark:text-foreground',
    /** Add-filter menu trigger */
    addFilterMenuButton: '',
    /** Add-filter menu option */
    addFilterMenuItem: '',
    /** Filter search and actions container */
    base: 'flex flex-auto flex-col',
    /** Filter editor body */
    filterModalBody: '',
    /** Filter editor actions */
    filterModalFooter: 'justify-between',
    /** Filter editor heading */
    filterModalHeader: 'flex items-center gap-3 text-default-700',
    /** Search and active filter row */
    form: 'mb-3 flex flex-wrap gap-3',
    /** Editable search input */
    searchInput: '',
    /** Bordered search input surface */
    searchInputWrapper: '',
    /** Animated search reveal container */
    searchMotionDiv: 'flex w-72 gap-2',
    /** Search reveal button */
    searchShowButton: '',
    /** Search submit button */
    searchSubmitButton: '',
    /** Search controls container */
    searchWrapper: 'flex items-center',
  },
});

export type VariantProps = TVProps<typeof filterVariants>;

export type ClassName = TVClassName<typeof filterVariants>;

export type FilterClassNames = Record<
  keyof ReturnType<typeof filterVariants>,
  string
>;

export default filterVariants;
