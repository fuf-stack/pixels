import { tv } from '@fuf-stack/pixel-utils';

const fieldCardValidationErrorVariants = tv({
  slots: {
    /** Container for card-level validation messages */
    errorMessage: 'text-danger text-tiny',
    /** Footer containing card-level validation */
    helperWrapper: 'relative flex flex-col gap-1.5 p-0',
  },
});

export default fieldCardValidationErrorVariants;
