import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';
import type { FieldIds } from '../../partials/types';
import type { FieldCardProps } from '../FieldCard';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { fieldCardVariants } from '../fieldCardVariants';
import FieldCardValidationError from './FieldCardValidationError';

interface FieldCardControlProps extends Pick<
  FieldCardProps,
  'children' | 'className'
> {
  /** Custom accessible name */
  ariaLabel: string | undefined;
  /** Object-level validation errors */
  error: FieldError[] | undefined;
  /** IDs shared with the heading and error footer */
  ids: FieldIds;
  /** Shows invalid border and heading styling */
  invalid: boolean;
  /** Field label */
  label: ReactNode;
  /** Marks the heading when a registered child is required */
  required: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/** Card presentation with an accessible heading, content and animated error footer */
const FieldCardControl = ({
  ariaLabel,
  children,
  className,
  error,
  ids,
  invalid,
  label,
  required,
  testId,
}: FieldCardControlProps) => {
  // @ts-expect-error - object-level errors include an _errors property
  const hasObjectErrors = !!error?._errors;

  // className from slots
  const styling = useStyling();
  const variants = styling.resolve(fieldCardVariants, { invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      aria-describedby={hasObjectErrors ? ids.error : undefined}
      aria-label={!label ? ariaLabel : undefined}
      aria-labelledby={label ? ids.label : undefined}
      className={classNames.base}
      role="group"
    >
      {/* card header with label */}
      {label ? (
        <FieldLabel
          aria-level={3}
          as="div"
          className={classNames.label}
          id={ids.label}
          required={required}
          role="heading"
        >
          {label}
        </FieldLabel>
      ) : null}

      {/* card content */}
      <div className={classNames.content}>{children}</div>

      {/* card footer with validation errors - always show _errors, but danger styling controlled by showInvalid */}
      <FieldCardValidationError
        className={classNames.errorFooter}
        error={error}
        errorId={ids.error}
        errorTextClassName={classNames.errorText}
        testId={testId}
      />
    </div>
  );
};

export default FieldCardControl;
