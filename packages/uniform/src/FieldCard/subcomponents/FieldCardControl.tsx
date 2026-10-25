import type { UniformField } from '../../hooks/useUniformField/types';
import type { FieldCardProps } from '../FieldCard';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { fieldCardVariants } from '../fieldCardVariants';
import FieldCardValidationError from './FieldCardValidationError';

interface FieldCardControlProps extends Pick<
  FieldCardProps,
  'children' | 'className'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField;
}

/** Card presentation with an accessible heading, content and animated error footer */
const FieldCardControl = ({
  field,
  children,
  className,
}: FieldCardControlProps) => {
  const { ariaLabel, error, ids, invalid, label, required, testId } = field;

  const styling = useStyling();

  // @ts-expect-error - object-level errors include an _errors property
  const hasObjectErrors = !!error?._errors;

  // classNames from slots
  const variants = styling.resolve(fieldCardVariants, { invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      aria-describedby={hasObjectErrors ? ids.error : undefined}
      aria-label={!label ? ariaLabel : undefined}
      aria-labelledby={label ? ids.label : undefined}
      className={classNames.base}
      data-component="field-card"
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

      {/* card footer with object-level validation messages */}
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
