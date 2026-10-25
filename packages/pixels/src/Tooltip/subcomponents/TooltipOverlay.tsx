import type { TooltipSurfaceProps } from './TooltipSurface';

import { useContext } from 'react';
import { TooltipTriggerStateContext } from 'react-aria-components';

import { AnimatePresence, useReducedMotion } from '@fuf-stack/pixel-motion';

import TooltipSurface from './TooltipSurface';

/** Keeps the tooltip mounted until its exit feedback finishes */
const TooltipOverlay = (props: TooltipSurfaceProps) => {
  const state = useContext(TooltipTriggerStateContext);
  const reducedMotion = useReducedMotion();

  const content = state?.isOpen ? <TooltipSurface {...props} /> : null;

  return reducedMotion ? content : <AnimatePresence>{content}</AnimatePresence>;
};

export default TooltipOverlay;
