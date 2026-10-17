import type { MenuSurfaceProps } from './MenuSurface';

import { useContext } from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

import { AnimatePresence, useReducedMotion } from '@fuf-stack/pixel-motion';

import MenuSurface from './MenuSurface';

type MenuOverlayProps = Omit<MenuSurfaceProps, 'state'>;

/** Keeps menu exit feedback separate from its trigger state */
const MenuOverlay = ({
  disableAnimation = false,
  ...props
}: MenuOverlayProps) => {
  const state = useContext(OverlayTriggerStateContext);
  const reducedMotion = useReducedMotion();

  const content = state?.isOpen ? (
    <MenuSurface
      {...props}
      disableAnimation={disableAnimation || !!reducedMotion}
      state={state}
    />
  ) : null;

  return disableAnimation || reducedMotion ? (
    content
  ) : (
    <AnimatePresence>{content}</AnimatePresence>
  );
};

export default MenuOverlay;
