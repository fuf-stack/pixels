import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { DrawerProps as HeroDrawerProps } from '@heroui/drawer';
import type { ReactNode } from 'react';

import {
  Drawer as HeroDrawer,
  DrawerBody as HeroDrawerBody,
  DrawerContent as HeroDrawerContent,
  DrawerFooter as HeroDrawerFooter,
  DrawerHeader as HeroDrawerHeader,
} from '@heroui/drawer';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// drawer variants
export const drawerVariants = tv({
  slots: {
    wrapper: '',
    base: '',
    backdrop: '',
    header: '',
    body: '',
    footer: '',
    closeButton: '',
  },
});

export const drawerSizes = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  'full',
] as const;
export type DrawerSizes = (typeof drawerSizes)[number];

export const drawerRadii = ['none', 'sm', 'md', 'lg'] as const;
export type DrawerRadius = (typeof drawerRadii)[number];

export const drawerBackdrops = ['opaque', 'transparent', 'blur'] as const;
export type DrawerBackdrop = (typeof drawerBackdrops)[number];

export const drawerPlacements = ['left', 'right', 'top', 'bottom'] as const;
export type DrawerPlacement = (typeof drawerPlacements)[number];

type VariantProps = TVProps<typeof drawerVariants>;
type ClassName = TVClassName<typeof drawerVariants>;

export interface DrawerProps extends VariantProps {
  /** The backdrop style of the Drawer. */
  backdrop?: DrawerBackdrop;
  /** Drawer body content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Custom close button to display on top right corner. */
  closeButton?: ReactNode;
  /** Footer of the Drawer. */
  footer?: ReactNode;
  /** Header of the Drawer. */
  header?: ReactNode;
  /** Whether to hide the drawer close button. */
  hideCloseButton?: boolean;
  /** Whether the drawer is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the drawer can be closed by clicking on the overlay or pressing the Esc key. */
  isDismissable?: boolean;
  /** Handler that is called when the drawer is closed. */
  onClose?: () => void;
  /** Handler that is called when the drawer's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** The drawer position. */
  placement?: DrawerPlacement;
  /** The container element in which the overlay portal will be placed */
  portalContainer?: HeroDrawerProps['portalContainer'];
  /** The drawer border radius. */
  radius?: DrawerRadius;
  /** The drawer size. */
  size?: DrawerSizes;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Drawer component based on [HeroUI Drawer](https://www.heroui.com//docs/components/drawer)
 */
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
  // classNames from slots
  const variants = drawerVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <HeroDrawer
      backdrop={backdrop}
      classNames={classNames}
      closeButton={closeButton}
      data-testid={testId}
      hideCloseButton={hideCloseButton}
      isDismissable={isDismissable}
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      placement={placement}
      portalContainer={portalContainer}
      radius={radius}
      scrollBehavior="inside"
      size={size}
    >
      <HeroDrawerContent data-testid={testId ? `drawer_${testId}` : 'drawer'}>
        {() => (
          <>
            {header && <HeroDrawerHeader>{header}</HeroDrawerHeader>}
            <HeroDrawerBody id="drawer_body">{children}</HeroDrawerBody>
            {footer && <HeroDrawerFooter>{footer}</HeroDrawerFooter>}
          </>
        )}
      </HeroDrawerContent>
    </HeroDrawer>
  );
};

export default Drawer;
