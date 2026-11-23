import { tv } from '@fuf-stack/pixel-utils';

import { fieldHelperVariants } from '../../partials/FieldHelper/fieldHelperVariants';

// own recipe identity, so styling can target FieldCard errors separately
const fieldCardValidationErrorVariants = tv({ extend: fieldHelperVariants });

export default fieldCardValidationErrorVariants;
