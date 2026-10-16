import type { ComponentProps, ReactNode } from 'react';
import type { FieldIds } from '../types';

import FieldDescription from '../FieldDescription/FieldDescription';
import FieldLabel from '../FieldLabel/FieldLabel';

type ClassName = Partial<
  Record<'description' | 'errorMessage' | 'helperWrapper' | 'label', string>
>;

interface FieldLayoutProps {
  /** Editable field content */
  children: ReactNode;
  /** CSS class name */
  className: ClassName;
  /** Help text */
  description?: ReactNode;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** IDs shared with the editable control */
  ids: FieldIds;
  /** Shows the validation message */
  invalid: boolean;
  /** Field label */
  label?: ReactNode;
  /** Label element, use React Aria Label inside group engines */
  labelAs?: ComponentProps<typeof FieldLabel>['as'];
  /** Shows the required indicator */
  required?: boolean;
}

/**
 * Default arrangement of a field label, editable content and supporting messages
 *
 * Renders a fragment inside the field root, which owns the base element and
 * interaction context. Receives IDs, resolved classes and validation state
 */
const FieldLayout = ({
  children,
  className,
  description = undefined,
  errorMessage,
  ids,
  invalid,
  label = undefined,
  labelAs = 'label',
  required = false,
}: FieldLayoutProps) => {
  return (
    <>
      <FieldLabel
        as={labelAs}
        className={className.label}
        htmlFor={labelAs === 'label' ? ids.control : undefined}
        id={ids.label}
        required={required}
      >
        {label}
      </FieldLabel>
      {children}
      {description || invalid ? (
        <div className={className.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={className.description}
            id={ids.description}
          >
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
      ) : null}
    </>
  );
};

export default FieldLayout;
