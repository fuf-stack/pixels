import type { FieldError } from 'react-hook-form';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { slugify } from '@fuf-stack/pixel-utils';

export interface FieldValidationErrorProps {
  /** CSS class name */
  className?: string;
  /** Field errors */
  error?: FieldError[];
  /** HTML data-testid attribute used in e2e tests */
  testId: string;
}

/**
 * Renders a validation error of a field
 */
const FieldValidationError = ({
  className = undefined,
  error = undefined,
  testId,
}: FieldValidationErrorProps) => {
  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  return (
    <ul
      aria-label={`Validation errors of field ${testId}`}
      className={className}
      data-testid={slugify(`${testId}_error`)}
    >
      <AnimatePresence initial={false}>
        {error?.map(({ message }, i) => {
          return (
            <motion.li
              key={slugify(`${testId}_error_${i}`)}
              exit={disableAnimation ? undefined : { opacity: 0, height: 0 }}
              initial={disableAnimation ? false : { height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'circOut' }}
              animate={
                disableAnimation ? undefined : { opacity: 1, height: 'auto' }
              }
            >
              <span className="p-1">{message}</span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
};

export default FieldValidationError;
