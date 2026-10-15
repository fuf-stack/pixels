import type { ReactNode } from 'react';
import type { InputClasses } from '../inputVariants';

import { Button } from 'react-aria-components';

/** Decorative direction indicator for the number stepper buttons. */
const Chevron = ({
  up = false,
}: {
  /** Point the chevron upward for the increment action. */
  up?: boolean;
}) => {
  return (
    <svg
      aria-hidden
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path d={up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
};

/**
 * React Aria Button that invokes the supplied clear action without taking focus.
 *
 * Uses slot=null to opt out of NumberField's increment/decrement button context.
 * Renders custom end content when supplied, otherwise the default clear icon.
 *
 * @see https://react-aria.adobe.com/Button
 * @see https://react-aria.adobe.com/NumberField
 */
export const InputClearButton = ({
  children = undefined,
  className,
  disabled = undefined,
  onClear,
}: {
  /** Optional replacement for the default clear icon. */
  children?: ReactNode;
  /** CSS class applied to the action button. */
  className: string;
  /** Whether the clear action is disabled. */
  disabled?: boolean;
  /** Clear the input value. */
  onClear: () => void;
}) => {
  return (
    <Button
      aria-label="clear input"
      className={className}
      data-slot="clear-button"
      isDisabled={disabled}
      onPress={onClear}
      preventFocusOnPress
      slot={null}
    >
      {children ?? (
        <svg aria-hidden height="1em" viewBox="0 0 24 24" width="1em">
          <path
            d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
            fill="currentColor"
          />
        </svg>
      )}
    </Button>
  );
};

/**
 * Increment and decrement React Aria Buttons for the surrounding NumberField.
 *
 * Named slots connect each button to NumberField's value and disabled state.
 * Keeps the controls outside the tab order so keyboard editing stays in the input.
 *
 * @see https://react-aria.adobe.com/NumberField
 * @see https://react-aria.adobe.com/Button
 */
export const InputStepper = ({
  classes,
}: {
  /** Resolved Input slot class names. */
  classes: InputClasses;
}) => {
  return (
    <div className={classes.stepper} data-slot="stepper-wrapper">
      <Button
        className={classes.stepperButton}
        data-slot="increase-button"
        slot="increment"
        tabIndex={-1}
      >
        <Chevron up />
      </Button>
      <Button
        className={classes.stepperButton}
        data-slot="decrease-button"
        slot="decrement"
        tabIndex={-1}
      >
        <Chevron />
      </Button>
    </div>
  );
};
