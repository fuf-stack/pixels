import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ModalProps as HeroModalProps } from '@heroui/modal';
import type { ReactNode } from 'react';

import {
  Modal as HeroModal,
  ModalBody as HeroModalBody,
  ModalContent as HeroModalContent,
  ModalFooter as HeroModalFooter,
  ModalHeader as HeroModalHeader,
} from '@heroui/modal';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// modal variants
export const modalVariants = tv({
  slots: {
    backdrop: '',
    base: '',
    body: 'py-4',
    closeButton: '',
    footer: 'border-t-divider border-t',
    header: 'border-b-divider border-b',
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
  portalContainer?: HeroModalProps['portalContainer'];
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
    <HeroModal
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
      <HeroModalContent data-testid={testId ? `modal_${testId}` : 'modal'}>
        {() => {
          return (
            <>
              {header ? <HeroModalHeader>{header}</HeroModalHeader> : null}
              <HeroModalBody id="modal_body">{children}</HeroModalBody>
              {footer ? <HeroModalFooter>{footer}</HeroModalFooter> : null}
            </>
          );
        }}
      </HeroModalContent>
    </HeroModal>
  );
};

export default Modal;
