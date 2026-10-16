import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../../hooks/useUniformField/useUniformField';
import FieldValidationError from '../../partials/FieldValidationError/FieldValidationError';
import fieldArrayValidationErrorVariants from './fieldArrayValidationErrorVariants';

export interface FieldArrayValidationErrorProps {
  /** Field name */
  name: string;
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
  name,
}: FieldArrayValidationErrorProps) => {
  const { error, ids, invalid, testId } = useUniformField({
    name,
  });

  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(fieldArrayValidationErrorVariants);
  const classNames = styling.variantsToClassNames(variants);

  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = invalid && error?._errors;

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
              // @ts-expect-error - error._errors exists but not typed
              error={error._errors}
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
