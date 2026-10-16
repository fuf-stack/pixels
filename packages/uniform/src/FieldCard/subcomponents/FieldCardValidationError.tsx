import type { FieldError } from 'react-hook-form';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../../hooks/useUniformField/useUniformField';
import FieldValidationError from '../../partials/FieldValidationError/FieldValidationError';
import fieldCardValidationErrorVariants from './fieldCardValidationErrorVariants';

export interface FieldCardValidationErrorProps {
  /** CSS class name */
  className?: string;
  /** Error object from parent FieldCard (passed directly to avoid duplicate hook calls) */
  error?: FieldError[] | undefined;
  /** CSS class name for the error text (controls color based on invalid state) */
  errorTextClassName?: string;
  /** Optional error association ID supplied by the owning group. */
  errorId?: string;
  /** Field name */
  name: string;
}

/**
 * Renders validation errors in the footer of a FieldCard component.
 *
 * This component handles displaying field-level validation errors with proper
 * accessibility attributes and animates them in/out using Framer Motion.
 *
 * Note: Object-level errors (_errors) are always shown when they exist,
 * but the danger styling is controlled by the parent FieldCard based on
 * whether child fields have been touched.
 */
const FieldCardValidationError = ({
  className = undefined,
  error = undefined,
  errorTextClassName = undefined,
  errorId = undefined,
  name,
}: FieldCardValidationErrorProps) => {
  const { ids, testId } = useUniformField({
    name,
  });

  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(fieldCardValidationErrorVariants);
  const classNames = styling.variantsToClassNames(variants, {
    errorMessage: errorTextClassName,
    helperWrapper: className,
  });

  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  // Always show object-level errors (_errors) when they exist
  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = !!error?._errors;

  return (
    <AnimatePresence initial={!disableAnimation}>
      {hasErrors ? (
        <motion.div
          key="field-card-errors"
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
              id={errorId ?? ids.error}
              className={{ wrapper: classNames.errorMessage }}

              // @ts-expect-error - error._errors exists but not typed
              error={error._errors}
              testId={testId}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default FieldCardValidationError;
