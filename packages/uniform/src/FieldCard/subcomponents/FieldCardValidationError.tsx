import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { cn } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../../hooks/useUniformField';
import FieldValidationError from '../../partials/FieldValidationError/FieldValidationError';

export interface FieldCardValidationErrorProps {
  /** CSS class name for the error footer wrapper */
  className?: string;
  /** Field name */
  name: string;
}

/**
 * Renders validation errors in the footer of a FieldCard component.
 *
 * This component handles displaying field-level validation errors with proper
 * accessibility attributes and animates them in/out using Framer Motion.
 */
const FieldCardValidationError = ({
  className = undefined,
  name,
}: FieldCardValidationErrorProps) => {
  const { error, getErrorMessageProps, getHelperWrapperProps, testId } =
    useUniformField({
      name,
    });

  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  // Always show object-level errors (_errors) as they represent explicit
  // validation rules (e.g., refineObject custom validators)
  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = !!error?._errors;

  return (
    <AnimatePresence initial={!disableAnimation}>
      {hasErrors ? (
        <motion.div
          key="field-card-errors"
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
            className={cn(getHelperWrapperProps()?.className, className)}
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

export default FieldCardValidationError;
