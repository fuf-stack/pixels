import type { TooltipProps } from '../Tooltip';
import type { TooltipClassNames } from '../tooltipVariants';

import { useContext, useRef } from 'react';
import { Overlay, useOverlayPosition, useTooltip } from 'react-aria';
import {
  TooltipContext,
  TooltipTriggerStateContext,
  useSlottedContext,
} from 'react-aria-components';

import { motion, useReducedMotion } from '@fuf-stack/pixel-motion';

import TooltipContent from './TooltipContent';

export interface TooltipSurfaceProps extends Pick<
  TooltipProps,
  'containerPadding' | 'content' | 'footer' | 'header'
> {
  /** CSS class name */
  className: TooltipClassNames;
  /** Requested side and alignment of the tooltip */
  placement: NonNullable<TooltipProps['placement']>;
}

const placements = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top-start': 'top start',
  'top-end': 'top end',
  'bottom-start': 'bottom start',
  'bottom-end': 'bottom end',
  'left-start': 'left top',
  'left-end': 'left bottom',
  'right-start': 'right top',
  'right-end': 'right bottom',
} as const;

/**
 * Positioned tooltip with hover persistence and scale/fade feedback
 *
 * @see https://react-aria.adobe.com/Tooltip
 */
const TooltipSurface = ({
  className: classNames,
  containerPadding = 0,
  placement,
  ...contentProps
}: TooltipSurfaceProps) => {
  const state = useContext(TooltipTriggerStateContext);
  const context = useSlottedContext(TooltipContext);
  const ref = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // TooltipTrigger provides the association ID through its context
  const tooltipId =
    context && 'id' in context && typeof context.id === 'string'
      ? context.id
      : undefined;
  const { tooltipProps } = useTooltip(
    { id: tooltipId, isOpen: state?.isOpen },
    state ?? undefined,
  );
  const { overlayProps, placement: side } = useOverlayPosition({
    containerPadding,
    isOpen: state?.isOpen,
    offset: 10,
    onClose: () => {
      return state?.close(true);
    },
    overlayRef: ref,
    placement: placements[placement],
    shouldFlip: true,
    targetRef: context?.triggerRef ?? fallbackRef,
  });

  const alignment = placement.split('-')[1];
  const arrowPlacement = alignment ? `${side}-${alignment}` : side;

  return (
    <Overlay disableFocusManagement>
      <div
        {...tooltipProps}
        {...overlayProps}
        ref={ref}
        className={classNames.overlay}
        data-component="tooltip"
      >
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className={classNames.base}
          data-arrow
          data-open
          data-placement={arrowPlacement}
          data-slot="base"
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
          transition={{ bounce: 0, duration: 0.3, type: 'spring' }}
        >
          <TooltipContent {...contentProps} className={classNames} />
        </motion.div>
      </div>
    </Overlay>
  );
};

export default TooltipSurface;
