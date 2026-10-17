import type { HTMLAttributes, ReactNode } from 'react';
import type { ButtonProps } from 'react-aria-components';

import { cloneElement, isValidElement } from 'react';
import { mergeProps } from 'react-aria';
import { Button } from 'react-aria-components';

interface ModalCloseButtonProps {
  /** CSS class name */
  className: string;
  /** Optional element replacing the default close button */
  closeButton?: ReactNode;
  /** Callback when the close button is activated */
  onClose: () => void;
}

/**
 * Keyboard accessible close control with an optional custom element
 *
 * @see https://react-aria.adobe.com/Button
 */
const ModalCloseButton = ({
  className,
  closeButton = undefined,
  onClose,
}: ModalCloseButtonProps) => {
  // preserve the custom element, its content and its own event handlers
  const renderCustomButton: ButtonProps['render'] = (props) => {
    if (!isValidElement<HTMLAttributes<HTMLElement>>(closeButton)) {
      return <button {...props} type="button" />;
    }

    return cloneElement(closeButton, {
      ...mergeProps(closeButton.props, props),
      children: closeButton.props.children ?? props.children,
    });
  };

  return (
    <Button
      aria-label="Close"
      className={className}
      onPress={onClose}
      render={isValidElement(closeButton) ? renderCustomButton : undefined}
    >
      {isValidElement(closeButton) ? undefined : (
        <svg
          aria-hidden="true"
          className="fill-current"
          fill="none"
          focusable="false"
          height="1em"
          role="presentation"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
          width="1em"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </Button>
  );
};

export default ModalCloseButton;
