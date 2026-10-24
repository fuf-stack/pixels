import type { MotionProps } from '@fuf-stack/pixel-motion';
import type {
  CSSProperties,
  HTMLAttributes,
  PointerEvent,
  ReactNode,
} from 'react';
import type { OverlayTriggerState } from 'react-stately';
import type { ModalClassNames } from '../modalVariants';

import { useId, useRef } from 'react';
import {
  DismissButton,
  mergeProps,
  Overlay,
  useDialog,
  useModalOverlay,
} from 'react-aria';

import { motion } from '@fuf-stack/pixel-motion';

import useModalViewportHeight from '../hooks/useModalViewportHeight';
import ModalCloseButton from './ModalCloseButton';
import ModalSections from './ModalSections';

export interface ModalSurfaceProps {
  /** Prefix for the unique body association ID */
  bodyIdPrefix: string;
  /** Dialog body content */
  children: ReactNode;
  /** CSS class name */
  className: ModalClassNames;
  /** Optional custom close button */
  closeButton?: ReactNode;
  /** Identifies the public component owning the dialog */
  dataComponent?: string;
  /** Disables opening and closing feedback */
  disableAnimation: boolean;
  /** Optional footer content */
  footer?: ReactNode;
  /** Optional heading content */
  header?: ReactNode;
  /** Hides the visible close control */
  hideCloseButton?: boolean;
  /** Allows dismissal by pressing the backdrop */
  isDismissable?: boolean;
  /** Fallback accessible name when no heading is supplied */
  label: string;
  /** Direction of entry and exit feedback */
  placement?: 'center' | 'top' | 'right' | 'bottom' | 'left';
  /** Container for the dialog portal */
  portalContainer?: Element;
  /** Dialog visibility and interactions */
  state: OverlayTriggerState;
  /** HTML data-testid attribute for the dialog */
  testId: string;
}

/**
 * Modal dialog engine owning focus containment, dismissal and scroll blocking
 *
 * @see https://react-aria.adobe.com/Dialog
 * @see https://react-aria.adobe.com/Modal
 */
const ModalSurface = ({
  bodyIdPrefix,
  children,
  className: classNames,
  closeButton = undefined,
  dataComponent = 'modal',
  disableAnimation,
  footer = undefined,
  header = undefined,
  hideCloseButton = false,
  isDismissable = true,
  label,
  placement = 'center',
  portalContainer = undefined,
  state,
  testId,
}: ModalSurfaceProps) => {
  const viewportHeight = useModalViewportHeight();
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable },
    state,
    ref,
  );
  const { dialogProps, titleProps } = useDialog(
    { 'aria-label': header ? undefined : label },
    ref,
  );

  // accessibility hooks supply DOM props, motion owns drag and animation events
  const surfaceProps: Omit<
    HTMLAttributes<HTMLElement>,
    keyof MotionProps
  > = mergeProps(modalProps, dialogProps);

  const viewportStyle = {
    '--visual-viewport-height': viewportHeight
      ? `${viewportHeight}px`
      : undefined,
  } as CSSProperties;

  const bodyId = `${bodyIdPrefix}-${id}`;
  const horizontal = placement === 'left' || placement === 'right';
  const offset = placement === 'left' || placement === 'top' ? '-100%' : '100%';
  const initial =
    placement === 'center'
      ? { opacity: 0, scale: 1.03 }
      : { [horizontal ? 'x' : 'y']: offset };
  const animate =
    placement === 'center'
      ? { opacity: 1, scale: 1 }
      : { [horizontal ? 'x' : 'y']: 0 };

  // keep focus in the dialog while pressing its backdrop
  const handleBackdropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
    }
  };

  return (
    <Overlay
      isExiting={!state.isOpen}
      portalContainer={portalContainer}
      shouldContainFocus
    >
      {/* visual backdrop, the wrapper receives outside presses */}
      <motion.div
        animate={{ opacity: 1 }}
        aria-hidden="true"
        className={classNames.backdrop}
        data-slot="backdrop"
        exit={{ opacity: 0 }}
        initial={disableAnimation ? false : { opacity: 0 }}
        transition={{ duration: disableAnimation ? 0 : 0.25 }}
      />

      <div
        {...underlayProps}
        className={classNames.wrapper}
        data-component={dataComponent}
        data-slot="wrapper"
        onPointerDown={handleBackdropPointerDown}
        style={viewportStyle}
      >
        <motion.section
          {...surfaceProps}
          ref={ref}
          animate={animate}
          aria-describedby={bodyId}
          aria-modal="true"
          className={classNames.base}
          data-dismissable={isDismissable || undefined}
          data-open={state.isOpen || undefined}
          data-placement={placement}
          data-testid={testId}
          exit={initial}
          initial={disableAnimation ? false : initial}
          transition={{
            duration: disableAnimation ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <DismissButton onDismiss={state.close} />
          {!hideCloseButton ? (
            <ModalCloseButton
              className={classNames.closeButton}
              closeButton={closeButton}
              onClose={state.close}
            />
          ) : null}
          <ModalSections
            bodyId={bodyId}
            className={classNames}
            footer={footer}
            header={header}
            titleProps={titleProps}
          >
            {children}
          </ModalSections>
          <DismissButton onDismiss={state.close} />
        </motion.section>
      </div>
    </Overlay>
  );
};

export default ModalSurface;
