import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

import radioGroupFieldVariants from '../partials/RadioGroupField/radioGroupFieldVariants';

export const radiosVariants = tv({
  extend: radioGroupFieldVariants,
  slots: {
    /** Container for the field control and supporting text */
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
    ],
    /** Clickable radio option */
    itemBase: '',
    /** Indicator marking the selected option */
    itemControl: 'bg-focus group-data-[invalid=true]:bg-danger',
    /** Supporting text below an option label */
    itemDescription: '',
    /** Primary option text */
    itemLabel: 'text-sm',
    /** Container grouping option text */
    itemLabelWrapper: 'ml-2',
    /** Outline around the selection indicator */
    itemWrapper:
      'group-data-[invalid=true]:border-danger! [&:not(group-data-[invalid="true"]):not(group-data-[selected="false"])]:border-focus',
    /** Container arranging the selectable content */
    wrapper:
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
  },
});

export type VariantProps = TVProps<typeof radiosVariants>;

export type ClassName = TVClassName<typeof radiosVariants>;
