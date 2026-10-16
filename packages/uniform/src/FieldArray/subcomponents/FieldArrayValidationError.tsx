import type { FieldError } from 'react-hook-form';
import type { FieldIds } from '../../partials/types';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldValidationError from '../../partials/FieldValidationError/FieldValidationError';
import fieldArrayValidationErrorVariants from './fieldArrayValidationErrorVariants';

export interface FieldArrayValidationErrorProps {
  /** Array-level validation errors */
  error: FieldError[] | undefined;
  /** IDs shared with the owning field */
  ids: FieldIds;
  /** Shows array-level validation failure */
  invalid: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Renders array-level validation errors for FieldArray.
 *
 * This component handles validation errors that apply to the entire array
 * (e.g., "Array must contain at least 3 elements", "Array elements are not unique"),
 * as opposed to field-level errors which apply to individual array elements.
 *
 * The component wraps errors in the proper accessibility markup and animates
 * them in/out using Framer Motion when they appear or are resolved.
 */
const FieldArrayValidationError = ({
  error,
  ids,
  invalid,
  testId,
}: FieldArrayValidationErrorProps) => {
  const styling = useStyling();
  const disableAnimation = useReducedMotion();

  // classNames from slots
  const variants = styling.resolve(fieldArrayValidationErrorVariants);
  const classNames = styling.variantsToClassNames(variants);

  const objectErrors = (error as unknown as { _errors?: FieldError[] })
    ?._errors;
  const hasErrors = invalid && objectErrors;

  return (
    <AnimatePresence initial={!disableAnimation}>
      {hasErrors ? (
        <motion.div
          key="field-array-errors"
          animate={
            disableAnimation ? undefined : { opacity: 1, height: 'auto' }
          }
          exit={disableAnimation ? undefined : { opacity: 0, height: 0 }}
          initial={disableAnimation ? false : { height: 0, opacity: 0 }}
          style={{ overflow: 'hidden' }}
          transition={{ duration: 0.4, ease: 'circOut' }}
        >
          <div className={classNames.helperWrapper} data-slot="helper-wrapper">
            <FieldValidationError
              className={{ wrapper: classNames.errorMessage }}
              error={objectErrors}
              id={ids.error}
              testId={testId}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default FieldArrayValidationError;
