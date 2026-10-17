import type { ModalSurfaceProps } from './ModalSurface';

import { useOverlayTriggerState } from 'react-stately';

import { AnimatePresence, useReducedMotion } from '@fuf-stack/pixel-motion';

import ModalSurface from './ModalSurface';

interface ModalOverlayProps extends Omit<
  ModalSurfaceProps,
  'disableAnimation' | 'state'
> {
  /** Disables opening and closing feedback */
  disableAnimation?: boolean;
  /** Controlled dialog visibility */
  isOpen?: boolean;
  /** Callback when a close is requested */
  onClose?: () => void;
  /** Callback when visibility changes */
  onOpenChange?: (open: boolean) => void;
}

/** Visibility bridge retaining the dialog while its exit feedback finishes */
const ModalOverlay = ({
  disableAnimation = false,
  isOpen = undefined,
  onClose = undefined,
  onOpenChange = undefined,
  ...props
}: ModalOverlayProps) => {
  const reducedMotion = useReducedMotion();

  // notify the owner, controlled visibility remains authoritative
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) {
      onClose?.();
    }
  };

  const state = useOverlayTriggerState({
    isOpen,
    onOpenChange: handleOpenChange,
  });
  const staticContent = disableAnimation || !!reducedMotion;
  const content = state.isOpen ? (
    <ModalSurface {...props} disableAnimation={staticContent} state={state} />
  ) : null;

  return staticContent ? content : <AnimatePresence>{content}</AnimatePresence>;
};

export default ModalOverlay;
