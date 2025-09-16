import type { FieldError } from 'react-hook-form';

import { slugify } from '@fuf-stack/pixel-utils';

export interface FieldValidationErrorProps {
  /** CSS class name */
  className?: string;
  /** Field errors */
  error: FieldError | FieldError[];
  /** HTML data-testid attribute used in e2e tests */
  testId: string;
}

/**
 * Renders a validation error of a field
 */
const FieldValidationError = ({
  className = undefined,
  error,
  testId,
}: FieldValidationErrorProps) => {
  // render nothing when no errors
  if (!error || (Array.isArray(error) && !error.length)) {
    return null;
  }

  // get errors as array
  const errors: FieldError[] = Array.isArray(error) ? error : [error];

  return (
    <ul
      aria-label={`Validation errors of field ${testId}`}
      className={className}
      data-testid={slugify(`${testId}_error`)}
    >
      {errors.map(({ message }, i) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`error_${i}`}>
            <div>{message}</div>
          </li>
        );
      })}
    </ul>
  );
};

export default FieldValidationError;
