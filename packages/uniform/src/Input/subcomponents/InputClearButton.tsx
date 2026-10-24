import type { ReactNode } from 'react';

import { Button } from 'react-aria-components';

interface InputClearButtonProps {
  /** Replaces the default clear icon */
  children?: ReactNode;
  /** CSS class name */
  className: string;
  /** Disables the clear button when the input is disabled */
  disabled?: boolean;
  /** Callback when the clear button is activated */
  onClear: () => void;
}

/**
 * React Aria Button that invokes the supplied clear action without taking focus.
 *
 * Uses slot=null to opt out of NumberField's increment/decrement button context.
 * Renders custom end content when supplied, otherwise the default clear icon.
 *
 * @see https://react-aria.adobe.com/Button
 * @see https://react-aria.adobe.com/NumberField
 */
const InputClearButton = ({
  children = undefined,
  className,
  disabled = undefined,
  onClear,
}: InputClearButtonProps) => {
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

export default InputClearButton;
