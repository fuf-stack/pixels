import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import radioGroupFieldVariants from '../partials/RadioGroupField/radioGroupFieldVariants';

export const radioBoxesVariants = tv({
  extend: radioGroupFieldVariants,
  slots: {
    /** Container for the field control and supporting text */
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
    ],
    /** Clickable option box */
    boxBase: '',
    /** Indicator marking the selected box */
    boxControl: '',
    /** Supporting text inside an option box */
    boxDescription: '',
    /** Primary option text */
    boxLabel: '',
    /** Container grouping option text */
    boxLabelWrapper: '',
    /** Container arranging the selectable content */
    wrapper:
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
  },
  variants: {
    readOnly: {
      true: {
        // drop hover feedback so read-only boxes do not look clickable
        boxBase: 'hover:bg-transparent',
      },
    },
  },
});

export type VariantProps = TVProps<typeof radioBoxesVariants>;

export type ClassName = TVClassName<typeof radioBoxesVariants>;
