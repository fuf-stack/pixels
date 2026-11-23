import type { TVClassName } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/**
 * Shared field label style, red while the field is invalid
 *
 * Field recipes compose `fieldLabelVariants.base` and add only structural
 * classes, such as display or a label beside the control. The bottom padding
 * spaces a stacked label from its control, so fields need no base gap.
 */
export const fieldLabelVariants = tv({
  base: 'cursor-default pb-1.5 text-small text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
});

export type FieldLabelVariantsClassName = TVClassName<
  typeof fieldLabelVariants
>;
