import { Button } from 'react-aria-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

interface InputPasswordToggleProps {
  /** CSS class name */
  className: string;
  /** Identifies the input controlled by the visibility action */
  controlId: string;
  /** Disables password visibility changes */
  disabled?: boolean;
  /** Callback invoked when visibility is toggled */
  onToggle: () => void;
  /** Identifies the toggle in tests */
  testId: string;
  /** Shows the password as plain text */
  visible: boolean;
}

/**
 * Password visibility action preserving input focus on pointer activation
 *
 * @see https://react-aria.adobe.com/Button
 */
const InputPasswordToggle = ({
  className,
  controlId,
  disabled = false,
  onToggle,
  testId,
  visible,
}: InputPasswordToggleProps) => {
  return (
    <Button
      aria-controls={controlId}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      className={className}
      data-testid={`${testId}_password_toggle`}
      isDisabled={disabled}
      onPress={onToggle}
      preventFocusOnPress
      slot={null}
      type="button"
    >
      {visible ? (
        <FaEyeSlash aria-hidden="true" />
      ) : (
        <FaEye aria-hidden="true" />
      )}
    </Button>
  );
};

export default InputPasswordToggle;
