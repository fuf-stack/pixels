import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { checkFieldIsRequired, useFormContext } from '../hooks/useFormContext';
import { useUniformField } from '../hooks/useUniformField';
import FieldCardValidationError from './subcomponents/FieldCardValidationError';

/**
 * Recursively checks if any child field with an error is also touched.
 * Returns true if at least one touched child has an error.
 */
export const hasVisibleChildErrors = (
  errors: Record<string, unknown> | undefined,
  touched: Record<string, unknown> | undefined,
): boolean => {
  if (!errors || !touched) {
    return false;
  }

  return Object.keys(errors)
    .filter((key) => {
      // Skip object-level errors (_errors) - those are handled separately
      return key !== '_errors';
    })
    .some((key) => {
      const errorValue = errors[key];
      const touchedValue = touched[key];

      // If this key doesn't exist in both errors and touched, skip
      if (errorValue === undefined || touchedValue === undefined) {
        return false;
      }

      // If errorValue is an array, it's a leaf field error
      if (Array.isArray(errorValue)) {
        // touchedValue being truthy means the field is touched
        return !!touchedValue;
      }

      // Recursively check nested objects
      if (typeof errorValue === 'object' && errorValue !== null) {
        return hasVisibleChildErrors(
          errorValue as Record<string, unknown>,
          touchedValue as Record<string, unknown>,
        );
      }

      return false;
    });
};

export const fieldCardVariants = tv({
  slots: {
    /** base class for the field card wrapper */
    base: [
      // base styles
      'overflow-hidden rounded-small border bg-content1',
      // animate border color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
    ],
    /** class for the label/header */
    label: [
      // override HeroUI label positioning and display
      'pointer-events-auto! static! z-auto! block! w-full!',
      // reset any transforms or translations
      'translate-x-0! translate-y-0! transform-none!',
      // card header styling - use text-medium (16px) for proper header size
      'rounded-t-small border-b p-3 font-semibold text-medium',
      // animate border and text color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
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
      // force helper to be visible and add padding (pt-1 to compensate for inner content's top padding)
      'block px-3 pb-2 pt-1',
      // animate border color change, respect reduced motion
      'transition-colors duration-150 motion-reduce:transition-none',
    ],
    /** class for the error text (empty base, color controlled by variant) */
    errorText: [],
  },
  variants: {
    invalid: {
      true: {
        base: 'border-danger-200',
        label: 'border-danger-200 text-danger',
        errorFooter: 'border-danger-200',
        errorText: '!text-danger text-tiny',
      },
      false: {
        base: 'border-divider',
        label: 'border-divider text-foreground',
        errorFooter: 'border-divider',
        errorText: '!text-foreground-500 text-tiny',
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
  const { error, getLabelProps, label } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  const {
    control,
    formState: { touchedFields, submitCount },
    validation,
  } = useFormContext();

  // Check if any registered child field is required
  const validationInstance = validation?.baseInstance ?? validation?.instance;
  const registeredFields: string[] = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (control as any)._names?.mount ?? [],
  );
  const childFieldPrefix = `${name}.`;
  const isRequired = validationInstance
    ? registeredFields
        .filter((f) => {
          return f.startsWith(childFieldPrefix);
        })
        .some((f) => {
          return checkFieldIsRequired(
            validationInstance,
            f.split('.').filter((k) => {
              return k !== '';
            }),
          );
        })
    : false;

  // Get touched state for this field's children by traversing the path
  const getNestedValue = (
    obj: Record<string, unknown> | undefined,
    path: string,
  ): Record<string, unknown> | undefined => {
    if (!obj) {
      return undefined;
    }
    const keys = path.split('.');
    let current: unknown = obj;
    keys.every((key) => {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[key];
        return true;
      }
      current = undefined;
      return false;
    });
    return current as Record<string, unknown> | undefined;
  };

  const fieldTouched = getNestedValue(
    touchedFields as Record<string, unknown>,
    name,
  );

  // Check for object-level errors (_errors)
  // @ts-expect-error - error._errors exists but not typed
  const hasObjectErrors = !!error?._errors;

  // Check if any child field is touched
  const hasAnyChildTouched =
    fieldTouched &&
    Object.keys(fieldTouched).some((key) => {
      return key !== '_errors';
    });

  // Check if any child field with an error is also touched
  const hasVisibleChildren =
    submitCount > 0 ||
    hasVisibleChildErrors(
      error as unknown as Record<string, unknown>,
      fieldTouched,
    );

  // Show invalid styling (red border/header) only when:
  // - Object errors exist AND at least one child field is touched, OR
  // - Child field errors are visible (touched with errors)
  const showInvalid =
    (hasObjectErrors && (submitCount > 0 || !!hasAnyChildTouched)) ||
    hasVisibleChildren;

  // className from slots
  const variants = fieldCardVariants({ invalid: showInvalid });
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <div className={className.base}>
      {/* card header with label */}
      {label ? (
        <div
          {...getLabelProps()}
          aria-level={3}
          // Override getLabelProps className to use our own invalid styling based on hasErrors,
          // not HeroUI's which is based on any child field being invalid
          className={className.label}
          role="heading"
        >
          {label}
          {/* Manual asterisk: getLabelProps uses schema-required for the object itself,
              but FieldCard needs asterisk based on whether any CHILD field is required */}
          {isRequired ? (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </div>
      ) : null}

      {/* card content */}
      <div className={className.content}>{children}</div>

      {/* card footer with validation errors - always show _errors, but danger styling controlled by showInvalid */}
      <FieldCardValidationError
        className={className.errorFooter}
        error={error}
        errorTextClassName={className.errorText}
        name={name}
      />
    </div>
  );
};

export default FieldCard;
