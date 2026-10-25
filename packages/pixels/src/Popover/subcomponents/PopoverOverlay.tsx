import type { PopoverProps as AriaPopoverProps } from 'react-aria-components';
import type { PopoverProps } from '../Popover';
import type { PopoverClassNames } from '../popoverVariants';

import { useContext, useRef } from 'react';
import {
  DismissButton,
  FocusScope,
  Overlay,
  useOverlay,
  useOverlayPosition,
} from 'react-aria';
import {
  OverlayTriggerStateContext,
  PopoverContext,
  useSlottedContext,
} from 'react-aria-components';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from '@fuf-stack/pixel-motion';

import PopoverContent from './PopoverContent';

interface PopoverOverlayProps extends Pick<
  PopoverProps,
  'content' | 'contentTestId' | 'footer' | 'header' | 'portalContainer'
> {
  /** CSS class name */
  className: PopoverClassNames;
  /** Requested position relative to the trigger */
  placement: NonNullable<PopoverProps['placement']>;
  /** Prevents page scrolling while the overlay is mounted */
  shouldBlockScroll: boolean;
}

const placements = {
  top: 'top',
  'top-start': 'top start',
  'top-end': 'top end',
  bottom: 'bottom',
  'bottom-start': 'bottom start',
  'bottom-end': 'bottom end',
  left: 'left',
  'left-start': 'left top',
  'left-end': 'left bottom',
  right: 'right',
  'right-start': 'right top',
  'right-end': 'right bottom',
} satisfies Record<
  NonNullable<PopoverProps['placement']>,
  AriaPopoverProps['placement']
>;

/**
 * Non-modal overlay with positioning, outside dismissal and focus restoration
 *
 * Uses the overlay hooks so outside presses dismiss without a blocking underlay
 * Scroll locking remains independent, and portals retain their Element contract
 *
 * @see https://react-aria.adobe.com/Popover
 * @see https://react-aria.adobe.com/FocusScope
 */
const PopoverOverlay = ({
  className: classNames,
  placement,
  portalContainer = undefined,
  ...props
}: PopoverOverlayProps) => {
  const state = useContext(OverlayTriggerStateContext);
  const context = useSlottedContext(PopoverContext);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fallbackTriggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  // leave the trigger's own press handler responsible for toggling
  const handleInteractOutside = (target: Element) => {
    return !context?.triggerRef?.current?.contains(target);
  };

  const { overlayProps } = useOverlay(
    {
      isDismissable: true,
      isOpen: state?.isOpen ?? false,
      onClose: state?.close,
      shouldCloseOnBlur: true,
      shouldCloseOnInteractOutside: handleInteractOutside,
    },
    overlayRef,
  );
  const position = useOverlayPosition({
    containerPadding: 12,
    isOpen: state?.isOpen ?? false,
    offset: 7,
    onClose: state?.close,
    overlayRef,
    placement: placements[placement],
    targetRef: context?.triggerRef ?? fallbackTriggerRef,
  });

  // keep alignment when the positioning engine flips to another side
  const [requestedSide, alignment] = placement.split('-');
  const animationPlacement =
    requestedSide === position.placement ? placement : position.placement;
  const arrowPlacement = alignment
    ? `${position.placement}-${alignment}`
    : position.placement;

  if (!state) {
    return null;
  }

  const content = state.isOpen ? (
    <Overlay
      key="popover"
      disableFocusManagement
      portalContainer={portalContainer}
    >
      <FocusScope restoreFocus>
        <div
          {...overlayProps}
          {...position.overlayProps}
          ref={overlayRef}
          data-component="popover"
          data-slot="overlay"
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={classNames.overlay}
            data-placement={animationPlacement ?? undefined}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            transition={{ bounce: 0, duration: 0.3, type: 'spring' }}
          >
            <PopoverContent
              {...props}
              className={classNames}
              placement={arrowPlacement}
            />
          </motion.div>
          <DismissButton onDismiss={state.close} />
        </div>
      </FocusScope>
    </Overlay>
  ) : null;

  return reducedMotion ? content : <AnimatePresence>{content}</AnimatePresence>;
};

export default PopoverOverlay;
