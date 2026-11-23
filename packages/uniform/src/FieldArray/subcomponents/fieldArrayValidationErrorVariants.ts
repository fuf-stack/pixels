import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../../partials/FieldHelper/fieldHelperVariants';

const fieldArrayValidationErrorVariants = tv({
  extend: fieldHelperVariants,
  slots: {
    /** Padded footer containing array-level validation */
    helperWrapper: 'px-3 pb-2 pt-1',
  },
});

export default fieldArrayValidationErrorVariants;
