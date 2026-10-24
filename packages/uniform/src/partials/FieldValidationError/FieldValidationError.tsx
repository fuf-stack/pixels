import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { FieldError } from 'react-hook-form';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';
import { slugify, tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

const fieldValidationErrorVariants = tv({
  slots: {
    /** List of validation messages */
    base: '',
    /** Animated entry for one validation message */
    item: '',
    /** Padded content inside an animated entry */
    message: 'px-1 pt-1',
    /** Associated error container rendered when an ID is supplied */
    wrapper: '',
  },
});

type ClassName = TVClassName<typeof fieldValidationErrorVariants>;

export interface FieldValidationErrorProps {
  /** CSS class name */
  className?: ClassName;
  /** Field errors */
  error?: FieldError[];
  /** Error association ID, adds a wrapper referenced by the editable control */
  id?: string;
  /** HTML data-testid attribute used in e2e tests */
  testId: string;
}

/**
 * Animated validation messages for a form field
 *
 * The owning field controls visibility. Supplying an ID adds an associated
 * error wrapper, otherwise the component renders the standalone list
 */
const FieldValidationError = ({
  className = undefined,
  error = undefined,
  id = undefined,
  testId,
}: FieldValidationErrorProps) => {
  const styling = useStyling();
  // disable all animation if user prefers reduced motion
  const disableAnimation = useReducedMotion();

  // classNames from slots
  const variants = styling.resolve(fieldValidationErrorVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  const errorList = (
    <ul
      aria-label={`Validation errors of field ${testId}`}
      className={classNames.base}
      data-component={id === undefined ? 'field-validation-error' : undefined}
      data-testid={slugify(`${testId}_error`)}
    >
      <AnimatePresence initial={!disableAnimation}>
        {error?.map(({ message }, i) => {
          return (
            <motion.li
              key={slugify(`${testId}_error_${i}`)}
              animate={
                disableAnimation ? undefined : { opacity: 1, height: 'auto' }
              }
              className={classNames.item}
              exit={disableAnimation ? undefined : { opacity: 0, height: 0 }}
              initial={disableAnimation ? false : { height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'circOut' }}
            >
              {/* wrap in div to apply padding and animation does not jump */}
              <div className={classNames.message}>{message}</div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );

  if (id === undefined) {
    return errorList;
  }

  return (
    <div
      className={classNames.wrapper}
      data-component="field-validation-error"
      data-slot="error-message"
      id={id}
    >
      {errorList}
    </div>
  );
};

export default FieldValidationError;
