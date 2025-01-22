import type { FieldError } from 'react-hook-form';

import { slugify } from '@fuf-stack/pixel-utils';

export interface FieldValidationErrorProps {
  className?: string;
  error: FieldError[] | Record<string, FieldError[]>;
  testId?: string;
}

/**
 * Renders a validation error of a field
 */
const FieldValidationError = ({
  className = undefined,
  error,
  testId = undefined,
}: FieldValidationErrorProps) => {
  if (!error) {
    return null;
  }

  let tmpErrors: FieldError[] = [];

  if (typeof error === 'object' && !(error instanceof Array)) {
    const errorObject = error as Record<string, FieldError[]>;
    Object.keys(error).forEach((key) => {
      tmpErrors = [...tmpErrors, ...errorObject[key]];
    });
  }

  const errorArray: FieldError[] =
    JSON.stringify(tmpErrors) !== '[]' ? tmpErrors : (error as FieldError[]);
  const errorStrings: string[] = errorArray.map((e) => e.message) as string[];
  const ariaString = `Error: ${errorStrings.join('\n')}`;

  return (
    <ul
      data-testid={slugify(testId || errorStrings.join())}
      aria-label={ariaString} // TODO: ist das richtig @Hannes?
      className={className}
    >
      {errorStrings.map((errorString: string, i: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`error_${i}`}>
          <div>{errorString}</div>
        </li>
      ))}
    </ul>
  );
};

export default FieldValidationError;
