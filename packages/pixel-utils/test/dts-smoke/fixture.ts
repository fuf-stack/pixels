import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { StylingProviderProps } from '@fuf-stack/pixels/StylingProvider';

import {
  createStyling,
  tv,
  variantsToClassNames,
} from '@fuf-stack/pixel-utils';

const styling = createStyling({
  extend: {
    classGroups: {
      'font-size': [{ text: ['body'] }],
      'field-padding': ['field-padding'],
    },
    conflictingClassGroups: { 'field-padding': ['p', 'px'] },
  },
});
const recipe = tv({
  slots: { base: 'p-2', input: 'text-sm text-danger' },
  variants: { size: { sm: { base: 'p-1' }, lg: { base: 'p-4' } } },
});
const props: TVProps<typeof recipe> = { size: 'lg' };
const classes: TVClassName<typeof recipe> = { input: ['text-body'] };
const resolved = styling.resolve(recipe, props);
const input: string = resolved.input({ size: 'sm', className: 'text-body' });
const base: string = styling.variantsToClassNames(
  resolved,
  classes,
  'base',
).base;
const conditionalClasses = {
  base: 'p-4',
  input: undefined as string | undefined,
};
const conditionalInput: string = styling.variantsToClassNames(
  resolved,
  conditionalClasses,
).input;
const standaloneInput: string = variantsToClassNames(
  resolved,
  conditionalClasses,
).input;
const provider: StylingProviderProps = { children: null, styling };

// @ts-expect-error unsupported variant must remain rejected
styling.resolve(recipe, { size: 'xl' });
// @ts-expect-error declared slots must remain checked
const unknownSlot: TVClassName<typeof recipe> = { missing: 'p-2' };

const extended = styling.tv({ extend: recipe, slots: { label: 'text-sm' } });
const label: string = styling.resolve(extended, { size: 'lg' }).label();
export {
  input,
  base,
  provider,
  unknownSlot,
  label,
  conditionalInput,
  standaloneInput,
};
