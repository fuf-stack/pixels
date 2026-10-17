import type { ButtonProps } from 'react-aria-components';

import { Button } from 'react-aria-components';

interface AlertCloseButtonProps {
  /** CSS class name */
  className: string;
  /** Callback when the alert is dismissed */
  onClose: () => void;
}

// retain the existing hover selectors using React Aria's interaction state
const renderButton: NonNullable<ButtonProps['render']> = (props, state) => {
  return (
    <button
      {...props}
      data-focus={state.isFocused || undefined}
      data-hover={state.isHovered || undefined}
      type="button"
    />
  );
};

/** Keyboard accessible action that dismisses its owning alert
 *
 * @see https://react-aria.adobe.com/Button
 */
const AlertCloseButton = ({ className, onClose }: AlertCloseButtonProps) => {
  return (
    <Button
      aria-label="Close"
      className={className}
      data-slot="closeButton"
      onPress={onClose}
      render={renderButton}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="20"
        role="presentation"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </Button>
  );
};

export default AlertCloseButton;
