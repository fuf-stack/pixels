import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ModalProps as NextModalProps } from '@heroui/modal';
import type { ReactNode } from 'react';

import {
  Modal as NextModal,
  ModalBody as NextModalBody,
  ModalContent as NextModalContent,
  ModalFooter as NextModalFooter,
  ModalHeader as NextModalHeader,
} from '@heroui/modal';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// modal variants
export const modalVariants = tv({
  slots: {
    backdrop: '',
    base: '',
    body: '',
    closeButton: '',
    footer: '',
    header: '',
    wrapper: '',
  },
  variants: {
    size: {
      sm: { base: 'max-w-sm' },
      md: { base: 'max-w-md' },
      lg: { base: 'max-w-lg' },
      xl: { base: 'max-w-5xl' },
      full: { base: 'h-[80dvh] max-w-full' },
    },
  },
});

type VariantProps = TVProps<typeof modalVariants>;
type ClassName = TVClassName<typeof modalVariants>;

export interface ModalProps extends VariantProps {
  /** modal body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Disable animations completely */
  disableAnimation?: boolean;
  /** modal footer */
  footer?: ReactNode;
  /** modal header */
  header?: ReactNode;
  /** open state (controlled) */
  isOpen: boolean;
  /** close event handler */
  onClose: () => void;
  /** The container element in which the overlay portal will be placed */
  portalContainer?: NextModalProps['portalContainer'];
  /** modal size */
  size?: VariantProps['size'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Modal component based on [HeroUI Modal](https://www.heroui.com//docs/components/modal)
 */
const Modal = ({
  children = null,
  className = undefined,
  disableAnimation = false,
  footer = undefined,
  header = undefined,
  isOpen,
  onClose,
  portalContainer = undefined,
  size = 'md',
  testId = undefined,
}: ModalProps) => {
  // classNames from slots
  const variants = modalVariants({ size });
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <NextModal
      backdrop="opaque"
      classNames={classNames}
      data-testid={testId}
      disableAnimation={disableAnimation}
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      portalContainer={portalContainer}
      scrollBehavior="inside"
    >
      <NextModalContent data-testid={testId ? `modal_${testId}` : 'modal'}>
        {() => (
          <>
            {header && <NextModalHeader>{header}</NextModalHeader>}
            <NextModalBody id="modal_body">{children}</NextModalBody>
            {footer && <NextModalFooter>{footer}</NextModalFooter>}
          </>
        )}
      </NextModalContent>
    </NextModal>
  );
};

export default Modal;
