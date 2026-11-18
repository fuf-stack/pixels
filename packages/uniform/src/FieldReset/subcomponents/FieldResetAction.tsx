import type { TVClassName } from '@fuf-stack/pixel-utils';

import { Button } from 'react-aria-components';
import { FaUndoAlt } from 'react-icons/fa';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';
import Tooltip from '@fuf-stack/pixels/Tooltip';

const fieldResetActionVariants = tv({
  slots: {
    /** Compact button that restores the field value */
    base: [
      // layout and clickable area
      'inline-flex size-6 shrink-0 items-center justify-center',
      // shape and warning color
      'rounded-sm text-warning',
      // show the clickable area on hover without dimming the icon
      'data-[hovered=true]:bg-warning/15',
      // keyboard focus indicator
      'outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-focus',
      // disabled state
      'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    ],
    /** Icon indicating the reset action */
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

/** Restores the field without taking focus or inheriting number stepper actions */
const FieldResetAction = ({
  className = undefined,
  disabled,
  isChanged,
  name,
  onReset,
  resetLabel,
}: FieldResetActionProps) => {
  const styling = useStyling();

  if (!isChanged) {
    return null;
  }

  // classNames from slots
  const variants = styling.resolve(fieldResetActionVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <Tooltip content={resetLabel}>
      <Button
        aria-label={`${resetLabel}: ${name}`}
        className={classNames.base}
        data-slot="reset-action"
        isDisabled={disabled}
        onPress={onReset}
        preventFocusOnPress
        slot={null}
        type="button"
      >
        <FaUndoAlt
          aria-hidden="true"
          className={classNames.icon}
          data-slot="icon"
        />
      </Button>
    </Tooltip>
  );
};

export default FieldResetAction;
