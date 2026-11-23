import type { ReactNode } from 'react';
import type { FieldIds } from '../types';

import FieldDescription from '../FieldDescription/FieldDescription';

type ClassName = Partial<
  Record<'description' | 'errorMessage' | 'helperWrapper', string>
>;

export interface FieldHelperProps {
  /** CSS class name */
  className?: ClassName;
  /** Help text */
  description?: ReactNode;
  /** Rendered validation messages */
  errorMessage?: ReactNode;
  /** IDs of the help text and validation message */
  ids: Pick<FieldIds, 'description' | 'error'>;
  /** Shows the validation message */
  invalid: boolean;
}

/**
 * Help text and validation messages below a field
 *
 * Renders nothing without help text or visible validation. The IDs match the
 * control's aria-describedby associations.
 */
const FieldHelper = ({
  className = {},
  description = undefined,
  errorMessage = undefined,
  ids,
  invalid,
}: FieldHelperProps) => {
  if (!description && !invalid) {
    return null;
  }

  return (
    <div className={className.helperWrapper} data-slot="helper-wrapper">
      <FieldDescription className={className.description} id={ids.description}>
        {description}
      </FieldDescription>
      {invalid ? (
        <div
          className={className.errorMessage}
          data-slot="error-message"
          id={ids.error}
        >
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};

export default FieldHelper;
