import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';
import FieldCardValidationError from './subcomponents/FieldCardValidationError';

export const fieldCardVariants = tv({
  slots: {
    /** base class for the field card wrapper */
    base: [
      // base styles
      'overflow-hidden rounded-small border bg-content1',
    ],
    /** class for the label/header */
    label: [
      // override HeroUI label positioning and display
      'pointer-events-auto! static! z-auto! block! w-full!',
      // reset any transforms or translations
      'translate-x-0! translate-y-0! transform-none!',
      // card header styling - use text-medium (16px) for proper header size
      'rounded-t-small border-b p-3 font-semibold text-medium',
    ],
    /** class for the content */
    content: [
      // same as p-3 of Card component
      'p-3',
      // default grid for form components (see Grid component)
      'grid gap-4',
    ],
    /** class for the error footer wrapper */
    errorFooter: [
      'border-t',
      // force helper to be visible and add padding
      'block px-3 py-2',
    ],
  },
  variants: {
    invalid: {
      true: {
        base: 'border-danger',
        label: 'border-danger text-danger',
        errorFooter: 'border-danger',
      },
      false: {
        base: 'border-divider',
        label: 'border-divider text-foreground',
        errorFooter: 'border-divider',
      },
    },
  },
  defaultVariants: {
    invalid: false,
  },
});

type ClassName = TVClassName<typeof fieldCardVariants>;

export interface FieldCardProps {
  /** Content to render inside the card */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Label content for the card header */
  label: ReactNode;
  /** Field name for validation */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * FieldCard component - A card-styled container with label header and error footer
 *
 * Displays form field content in a card layout with:
 * - Label/title in the header
 * - Content in the body
 * - Validation errors in the footer
 * - Danger outline when validation errors exist
 */
const FieldCard = ({
  children,
  className: _className = undefined,
  name,
  ...uniformFieldProps
}: FieldCardProps) => {
  const { error, getLabelProps, invalid, label } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = invalid && error?._errors;

  // className from slots
  const variants = fieldCardVariants({ invalid: hasErrors });
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <div className={className.base}>
      {/* card header with label */}
      {label ? (
        <div
          {...getLabelProps()}
          aria-level={3}
          className={cn(getLabelProps()?.className, className.label)}
          role="heading"
        >
          {label}
        </div>
      ) : null}

      {/* card content */}
      <div className={className.content}>{children}</div>

      {/* card footer with validation errors */}
      <FieldCardValidationError className={className.errorFooter} name={name} />
    </div>
  );
};

export default FieldCard;
