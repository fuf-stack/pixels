import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/**
 * Shared help text and validation message styles
 *
 * Field recipes compose `fieldHelperVariants.slots`. Help text and each
 * validation message carry their own top padding, so messages animate in
 * without a jump and the wrapper adds no spacing while empty.
 */
export const fieldHelperVariants = tv({
  slots: {
    /** Help text below the control */
    description: 'pt-1 text-tiny text-foreground-500',
    /** Validation message container */
    errorMessage: 'text-tiny text-danger',
    /** Container for help text and validation messages */
    helperWrapper: 'relative flex flex-col p-0',
  },
});

export type FieldHelperVariantsClassName = TVClassName<
  typeof fieldHelperVariants
>;
