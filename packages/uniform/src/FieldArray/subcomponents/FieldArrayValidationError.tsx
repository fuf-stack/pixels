import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { cn } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../../hooks/useUniformField';
import FieldValidationError from '../../partials/FieldValidationError/FieldValidationError';

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
  const {
    error,
    getErrorMessageProps,
    getHelperWrapperProps,
    invalid,
    testId,
  } = useUniformField({
    name,
  });

  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = invalid && error?._errors;

  return (
    <AnimatePresence initial={!disableAnimation}>
      {hasErrors ? (
        <motion.div
          key="field-array-errors"
          exit={disableAnimation ? undefined : { opacity: 0, height: 0 }}
          initial={disableAnimation ? false : { height: 0, opacity: 0 }}
          style={{ overflow: 'hidden' }}
          transition={{ duration: 0.4, ease: 'circOut' }}
          animate={
            disableAnimation ? undefined : { opacity: 1, height: 'auto' }
          }
        >
          <div
            {...getHelperWrapperProps()}
            className={cn(
              getHelperWrapperProps()?.className,
              // force helper to be visible and add padding (pt-1 to compensate for inner content's top padding)
              'block px-3 pb-2 pt-1',
            )}
          >
            <div {...getErrorMessageProps()}>
              <FieldValidationError
                // @ts-expect-error - error._errors exists but not typed
                error={error._errors}
                testId={testId}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default FieldArrayValidationError;
