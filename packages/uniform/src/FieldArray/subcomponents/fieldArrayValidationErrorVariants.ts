import { tv } from '@fuf-stack/pixel-utils';

const fieldArrayValidationErrorVariants = tv({
  slots: {
    /** Padded footer containing array-level validation */
    helperWrapper: ['relative flex-col gap-1.5', 'block px-3 pb-2 pt-1'],
    /** Container for array-level validation messages */
    errorMessage: 'text-danger text-tiny',
  },
});

export default fieldArrayValidationErrorVariants;
