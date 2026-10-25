import type { ReactNode } from 'react';
import type {
  ClassName,
  DrawerBackdrop,
  DrawerPlacement,
  DrawerRadius,
  DrawerSizes,
} from './drawerVariants';

import ModalOverlay from '../Modal/subcomponents/ModalOverlay';
import { useStyling } from '../StylingProvider';
import { drawerVariants } from './drawerVariants';

export {
  drawerBackdrops,
  drawerPlacements,
  drawerRadii,
  drawerSizes,
  drawerVariants,
} from './drawerVariants';
export type {
  DrawerBackdrop,
  DrawerPlacement,
  DrawerRadius,
  DrawerSizes,
} from './drawerVariants';

export interface DrawerProps {
  /** Backdrop appearance */
  backdrop?: DrawerBackdrop;
  /** Drawer body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Element replacing the default close button */
  closeButton?: ReactNode;
  /** Actions below the body */
  footer?: ReactNode;
  /** Title above the body */
  header?: ReactNode;
  /** Hides the visible close control */
  hideCloseButton?: boolean;
  /** Allows dismissal by pressing the backdrop */
  isDismissable?: boolean;
  /** Controlled drawer visibility */
  isOpen?: boolean;
  /** Callback when closing is requested */
  onClose?: () => void;
  /** Callback when visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Edge where the drawer appears */
  placement?: DrawerPlacement;
  /** Portal container, defaults to document.body */
  portalContainer?: Element;
  /** Corner radius on the inward-facing edges */
  radius?: DrawerRadius;
  /** Maximum width or height of the drawer */
  size?: DrawerSizes;
  /** HTML data-testid suffix for the dialog */
  testId?: string;
}

/** Edge-aligned dialog for supporting content and actions */
const Drawer = ({
  backdrop = 'opaque',
  children = null,
  className = undefined,
  closeButton = undefined,
  footer = undefined,
  header = undefined,
  hideCloseButton = false,
  isOpen = undefined,
  isDismissable = true,
  onClose = undefined,
  onOpenChange = undefined,
  placement = 'right',
  portalContainer = undefined,
  radius = 'lg',
  size = 'md',
  testId = undefined,
}: DrawerProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(drawerVariants, {
    backdrop,
    placement,
    radius,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <ModalOverlay
      bodyIdPrefix="drawer_body"
      className={classNames}
      closeButton={closeButton}
      dataComponent="drawer"
      footer={footer}
      header={header}
      hideCloseButton={hideCloseButton}
      isDismissable={isDismissable}
      isOpen={isOpen}
      label="Drawer"
      onClose={onClose}
      onOpenChange={onOpenChange}
      placement={placement}
      portalContainer={portalContainer}
      testId={testId ? `drawer_${testId}` : 'drawer'}
    >
      {children}
    </ModalOverlay>
  );
};

export default Drawer;
