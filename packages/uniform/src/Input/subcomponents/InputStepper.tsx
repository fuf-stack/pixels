import type { InputClassNames } from '../inputVariants';

import { Button } from 'react-aria-components';

interface ChevronProps {
  /** Points the chevron upward for the increment action */
  up?: boolean;
}

/** Decorative direction indicator for the number stepper buttons. */
const Chevron = ({ up = false }: ChevronProps) => {
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

interface InputStepperProps {
  /** CSS class name */
  className: InputClassNames;
}

/**
 * Increment and decrement React Aria Buttons for the surrounding NumberField.
 *
 * Named slots connect each button to NumberField's value and disabled state.
 * Keeps the controls outside the tab order so keyboard editing stays in the input.
 *
 * @see https://react-aria.adobe.com/NumberField
 * @see https://react-aria.adobe.com/Button
 */
const InputStepper = ({ className }: InputStepperProps) => {
  return (
    <div className={className.stepper} data-slot="stepper-wrapper">
      <Button
        className={className.stepperButton}
        data-slot="increase-button"
        slot="increment"
      >
        <Chevron up />
      </Button>
      <Button
        className={className.stepperButton}
        data-slot="decrease-button"
        slot="decrement"
      >
        <Chevron />
      </Button>
    </div>
  );
};

export default InputStepper;
