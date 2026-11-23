import { tv } from '@fuf-stack/pixel-utils';

const radioGroupFieldVariants = tv({
  slots: {
    /** Container grouping the label, options and hints */
    base: 'relative',
    /** Supporting text below the options */
    description: 'text-foreground-400 text-tiny',
    /** Container for validation messages */
    errorMessage: '',
    /** Label above the options */
    label: 'relative',
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
