import type { ContextType } from 'react';
import type { OverlayTriggerStateContext } from 'react-aria-components';
import type { MenuProps } from '../Menu';
import type { MenuClassNames } from '../menuVariants';

import { useRef } from 'react';
import {
  DismissButton,
  FocusScope,
  Overlay,
  useOverlay,
  useOverlayPosition,
  usePreventScroll,
} from 'react-aria';
import { PopoverContext, useSlottedContext } from 'react-aria-components';

import { motion } from '@fuf-stack/pixel-motion';

import MenuOptions from './MenuOptions';

export interface MenuSurfaceProps extends Pick<
  MenuProps,
  | 'ariaLabel'
  | 'disableAnimation'
  | 'items'
  | 'onAction'
  | 'placement'
  | 'portalContainer'
> {
  /** CSS class name */
  className: MenuClassNames;
  /** Visibility and close behavior supplied by MenuTrigger */
  state: NonNullable<ContextType<typeof OverlayTriggerStateContext>>;
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
 * Non-modal menu popup with positioning, outside dismissal and focus restoration
 *
 * @see https://react-aria.adobe.com/Menu
 * @see https://react-aria.adobe.com/Popover
 */
const MenuSurface = ({
  className: classNames,
  disableAnimation = false,
  placement = 'bottom',
  portalContainer = undefined,
  state,
  ...props
}: MenuSurfaceProps) => {
  const context = useSlottedContext(PopoverContext);
  const ref = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLButtonElement>(null);
  usePreventScroll({ isDisabled: !state.isOpen });
  const { overlayProps } = useOverlay(
    {
      isDismissable: true,
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      shouldCloseOnInteractOutside: (target) => {
        return !context?.triggerRef?.current?.contains(target);
      },
    },
    ref,
  );
  const position = useOverlayPosition({
    containerPadding: 12,
    isOpen: state.isOpen,
    offset: 7,
    onClose: state.close,
    overlayRef: ref,
    placement: placements[placement],
    targetRef: context?.triggerRef ?? fallbackRef,
  });

  return (
    <Overlay disableFocusManagement portalContainer={portalContainer}>
      <FocusScope restoreFocus>
        <div
          {...overlayProps}
          {...position.overlayProps}
          ref={ref}
          data-component="menu"
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={classNames.panel}
            exit={{
              opacity: 0,
              scale: 0.96,
              transition: { duration: disableAnimation ? 0 : 0.15 },
            }}
            initial={disableAnimation ? false : { opacity: 0, scale: 0.8 }}
            transition={{
              bounce: 0,
              duration: disableAnimation ? 0 : 0.3,
              type: 'spring',
            }}
          >
            <MenuOptions {...props} className={classNames} />
            <DismissButton onDismiss={state.close} />
          </motion.div>
        </div>
      </FocusScope>
    </Overlay>
  );
};

export default MenuSurface;
