import type { TVClassName } from '@fuf-stack/pixel-utils';

import { FaUndoAlt } from 'react-icons/fa';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

const fieldResetActionVariants = tv({
  slots: {
    base: [
      // Layout and clickable area
      'inline-flex size-6 shrink-0 items-center justify-center',
      // Shape and warning color
      'rounded-sm text-warning',
      // Show the clickable area on hover without dimming the icon
      'enabled:hover:bg-warning/15',
      // Keyboard focus indicator
      'outline-none focus-visible:ring-2 focus-visible:ring-focus',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    // Icon size within the clickable area
    icon: 'size-3.5',
  },
});

type ClassName = TVClassName<typeof fieldResetActionVariants>;

interface FieldResetActionProps {
  /** Applies CSS classes to the reset button and icon slots */
  className?: ClassName;
  /** Disables the reset button */
  disabled: boolean;
  /** Shows the reset button when the field has changed */
  isChanged: boolean;
  /** Identifies the field in the button's accessible label */
  name: string;
  /** Callback invoked when the reset button is pressed */
  onReset: () => void;
  /** Labels the reset button and its tooltip */
  resetLabel: string;
}

const FieldResetAction = ({
  className: _className = undefined,
  disabled,
  isChanged,
  name,
  onReset,
  resetLabel,
}: FieldResetActionProps) => {
  if (!isChanged) {
    return null;
  }

  // className from slots
  const variants = fieldResetActionVariants();
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <button
      aria-label={`${resetLabel}: ${name}`}
      className={className.base}
      disabled={disabled}
      onClick={onReset}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      title={resetLabel}
      type="button"
    >
      <FaUndoAlt aria-hidden="true" className={className.icon} />
    </button>
  );
};

export default FieldResetAction;
