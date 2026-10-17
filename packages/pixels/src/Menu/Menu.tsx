import type { Key, ReactNode } from 'react';
import type { MenuItemProps as AriaMenuItemProps } from 'react-aria-components';
import type { ButtonProps } from '../Button';
import type { PopoverProps } from '../Popover';
import type { ClassName } from './menuVariants';

import { MenuTrigger } from 'react-aria-components';

import { useStyling } from '../StylingProvider';
import { menuVariants } from './menuVariants';
import MenuOverlay from './subcomponents/MenuOverlay';
import MenuTriggerButton from './subcomponents/MenuTriggerButton';

export { menuVariants } from './menuVariants';

export interface MenuItem {
  /** CSS class name */
  className?: string;
  /** Slot name for styling and debugging */
  dataSlot?: string;
  /** Supporting text below the label */
  description?: string;
  /** Disables the action */
  disabled?: boolean;
  /** Icon before the label */
  icon?: ReactNode;
  /** Unique action key */
  key: string;
  /** Action label */
  label: ReactNode;
  /** Press callback for this action */
  onClick?: AriaMenuItemProps['onPress'];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Text used for typeahead when the label contains rich content */
  textValue?: string;
}

/**
 * Menu section type
 */
export interface MenuSection {
  /** Actions in the group */
  items: MenuItem[];
  /** Unique group key */
  key: string;
  /** Group heading */
  label: ReactNode;
}

export interface MenuProps {
  /** Accessible name for the menu */
  ariaLabel?: string;
  /** Trigger content, defaults to an ellipsis icon */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Disables opening and closing animations */
  disableAnimation?: boolean;
  /** Disables the menu trigger */
  isDisabled?: boolean;
  /** Actions and labelled groups */
  items: (MenuSection | MenuItem)[];
  /** Callback when an enabled action is selected */
  onAction?: (key: Key) => void;
  /** Position relative to the trigger */
  placement?: PopoverProps['placement'];
  /** Portal container, defaults to document.body */
  portalContainer?: PopoverProps['portalContainer'];
  /** HTML data-testid attribute for the trigger */
  testId?: string;
  /** Renders a styled trigger button with these options */
  triggerButtonProps?: Pick<
    ButtonProps,
    'className' | 'color' | 'disableAnimation' | 'disabled' | 'size' | 'variant'
  > & {
    /** Accessible name for the trigger */
    'aria-label'?: string;
    /** HTML data-testid attribute for the trigger */
    'data-testid'?: string;
    /** Slot name for the trigger */
    dataSlot?: string;
    /** Disables trigger ripple feedback */
    disableRipple?: boolean;
  };
}

/** Dropdown of grouped actions with pointer and keyboard navigation */
const Menu = ({
  ariaLabel = undefined,
  children = null,
  className = undefined,
  disableAnimation = false,
  isDisabled = false,
  items,
  onAction = undefined,
  placement = undefined,
  portalContainer = undefined,
  testId = undefined,
  triggerButtonProps = undefined,
}: MenuProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(menuVariants);
  const classNames = styling.variantsToClassNames(
    variants,
    className,
    'trigger',
  );

  return (
    <MenuTrigger>
      <MenuTriggerButton
        ariaLabel={ariaLabel}
        className={classNames.trigger}
        isDisabled={isDisabled}
        testId={testId}
        triggerButtonProps={triggerButtonProps}
      >
        {children}
      </MenuTriggerButton>
      <MenuOverlay
        ariaLabel={ariaLabel}
        className={classNames}
        disableAnimation={disableAnimation}
        items={items}
        onAction={onAction}
        placement={placement}
        portalContainer={portalContainer}
      />
    </MenuTrigger>
  );
};

export default Menu;
