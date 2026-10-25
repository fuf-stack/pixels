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
});

export default radioGroupFieldVariants;
