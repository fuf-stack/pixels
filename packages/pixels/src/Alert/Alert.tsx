import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './alertVariants';

import { useState } from 'react';

import { useStyling } from '../StylingProvider';
import { alertVariants } from './alertVariants';
import AlertCloseButton from './subcomponents/AlertCloseButton';
import AlertIcon from './subcomponents/AlertIcon';

export { alertVariants } from './alertVariants';
export type { VariantProps } from './alertVariants';

export interface AlertProps {
  /** Supporting message below the title */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Shows the dismiss action */
  closable?: boolean;
  /** Content displayed after the message */
  endContent?: ReactNode;
  /** Optional element replacing the status symbol */
  icon?: ReactNode;
  /** Callback after the alert is dismissed */
  onClose?: () => void;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Heading above the supporting message */
  title?: string;
  /** Message type and color treatment */
  variant?: VariantProps['variant'];
}

/** Status message with an optional title, supporting content and dismiss action */
const Alert = ({
  children = undefined,
  className = undefined,
  closable = false,
  endContent = undefined,
  icon = undefined,
  onClose = undefined,
  testId = undefined,
  title = undefined,
  variant = 'info',
}: AlertProps) => {
  const styling = useStyling();
  const [visible, setVisible] = useState(true);

  const hasDescription =
    children != null &&
    children !== '' &&
    (!Array.isArray(children) || children.length > 0);
  const hasTitleAndChildren = !!children && !!title;

  // classNames from slots
  const variants = styling.resolve(alertVariants, {
    hasTitleAndChildren,
    variant,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // hide the message before notifying its owner
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={classNames.base}
      data-closeable={closable || undefined}
      data-component="alert"
      data-has-description={hasDescription || undefined}
      data-has-title={!!title || undefined}
      data-slot="base"
      data-testid={testId}
      data-visible
      role="alert"
    >
      <div className={classNames.iconWrapper} data-slot="iconWrapper">
        <AlertIcon className={classNames.icon} icon={icon} variant={variant} />
      </div>

      {/* title and supporting message */}
      <div className={classNames.mainWrapper} data-slot="mainWrapper">
        {title ? (
          <div className={classNames.title} data-slot="title">
            {title}
          </div>
        ) : null}
        {hasDescription ? (
          <div className={classNames.description} data-slot="description">
            {children}
          </div>
        ) : null}
      </div>

      {/* trailing content and optional dismissal */}
      {endContent ? (
        <div className={classNames.endContent} data-slot="endContent">
          {endContent}
        </div>
      ) : null}
      {closable || onClose ? (
        <AlertCloseButton
          className={classNames.closeButton}
          onClose={handleClose}
        />
      ) : null}
    </div>
  );
};

export default Alert;
