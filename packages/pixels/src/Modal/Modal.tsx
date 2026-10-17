import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './modalVariants';

import { isTestEnvironment } from '@fuf-stack/pixel-utils';

import { useStyling } from '../StylingProvider';
import { modalVariants } from './modalVariants';
import ModalOverlay from './subcomponents/ModalOverlay';

export { modalVariants } from './modalVariants';

export interface ModalProps {
  /** Dialog body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Disables animations, defaults to true in tests */
  disableAnimation?: boolean;
  /** Actions below the body */
  footer?: ReactNode;
  /** Title above the body */
  header?: ReactNode;
  /** Controlled dialog visibility */
  isOpen: boolean;
  /** Callback when closing is requested */
  onClose: () => void;
  /** Portal container, defaults to document.body */
  portalContainer?: Element;
  /** Maximum width of the dialog */
  size?: VariantProps['size'];
  /** HTML data-testid suffix for the dialog */
  testId?: string;
}

/** Modal dialog for focused content and actions above the page */
const Modal = ({
  children = null,
  className = undefined,
  disableAnimation = isTestEnvironment(),
  footer = undefined,
  header = undefined,
  isOpen,
  onClose,
  portalContainer = undefined,
  size = 'md',
  testId = undefined,
}: ModalProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(modalVariants, { size });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <ModalOverlay
      bodyIdPrefix="modal_body"
      className={classNames}
      disableAnimation={disableAnimation}
      footer={footer}
      header={header}
      isOpen={isOpen}
      label="Dialog"
      onClose={onClose}
      portalContainer={portalContainer}
      testId={testId ? `modal_${testId}` : 'modal'}
    >
      {children}
    </ModalOverlay>
  );
};

export default Modal;
