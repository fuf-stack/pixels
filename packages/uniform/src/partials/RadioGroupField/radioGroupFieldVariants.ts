import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../FieldHelper/fieldHelperVariants';
import { fieldLabelVariants } from '../FieldLabel/fieldLabelVariants';

const radioGroupFieldVariants = tv({
  // reference slots instead of extending, tv types follow only one extend level
  slots: {
    /** Container grouping the label, options and hints */
    base: 'relative',
    /** Help text below the control */
    description: fieldHelperVariants.slots.description,
    /** Validation message container */
    errorMessage: fieldHelperVariants.slots.errorMessage,
    /** Container for help text and validation messages */
    helperWrapper: fieldHelperVariants.slots.helperWrapper,
    /** Label above the options */
    label: [fieldLabelVariants.base, 'relative inline-flex'],
    /** Container around the selectable options */
    wrapper: '',
  },
  variants: {
    readOnly: {
      true: {
        // inner controls set their own cursors, override every descendant
        base: 'cursor-not-allowed opacity-disabled **:cursor-not-allowed',
      },
    },
  },
});

export default radioGroupFieldVariants;
