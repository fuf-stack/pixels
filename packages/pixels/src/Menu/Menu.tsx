import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ButtonProps } from '@heroui/button';
import type {
  DropdownItemProps as HeroDropdownItemProps,
  DropdownProps as HeroDropdownProps,
  DropdownSectionProps as HeroDropdownSectionProps,
} from '@heroui/dropdown';
import type { Key, ReactNode } from 'react';

import { FaEllipsisVertical } from 'react-icons/fa6';

import { Button } from '@heroui/button';
import {
  Dropdown as HeroDropdown,
  DropdownItem as HeroDropdownItem,
  DropdownMenu as HeroDropdownMenu,
  DropdownSection as HeroDropdownSection,
  DropdownTrigger as HeroDropdownTrigger,
} from '@heroui/dropdown';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

/**
 * Menu item type
 */
export interface MenuItem {
  /** unique identifier */
  key: string;
  /** CSS class name */
  className?: string;
  /** additional description shown under the label */
  description?: string;
  /** disables the menu item */
  disabled?: boolean;
  /** menu item icon  */
  icon?: ReactNode;
  /** menu item name */
  label: ReactNode;
  /** click event handler */
  onClick?: HeroDropdownItemProps['onPress'];
  /** e2e test identifier */
  testId?: string;
}

/**
 * Menu section type
 */
export interface MenuSection {
  /** unique identifier */
  key: string;
  /** section label */
  label: ReactNode;
  /** section items (array of MenuItem) */
  items: MenuItem[];
}

// menu styling variants
export const menuVariants = tv({
  slots: {
    item: '',
    trigger: '',
  },
});

type VariantProps = TVProps<typeof menuVariants>;
type ClassName = TVClassName<typeof menuVariants>;

export interface MenuProps extends VariantProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** menu item structure */
  items: (MenuSection | MenuItem)[];
  /** disable menu trigger */
  isDisabled?: boolean;
  /** placement of the menu */
  placement?: HeroDropdownProps['placement'];
  /** called if item is selected */
  onAction?: (key: Key) => void;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** When defined a Button will be rendered as trigger (with provided props) instead of unstyled html button */
  triggerButtonProps?: Pick<
    ButtonProps,
    | 'aria-label'
    | 'className'
    | 'color'
    | 'disableAnimation'
    | 'disabled'
    | 'size'
    | 'variant'
  >;
}

/** returns String[] of disabled items/keys */
const getDisabledKeys = (items: (MenuSection | MenuItem)[]) => {
  return (
    items
      // @ts-expect-error typing issue with MenuSection | MenuItem
      .map((item) => (typeof item?.items === 'undefined' ? item : item.items))
      .flat<MenuItem[]>()
      .filter((item) => {
        return Object.hasOwn(item, 'disabled') && item.disabled === true;
      })
      .map((item) => item.key)
  );
};

const renderMenuItem = (item: MenuItem, itemClassName?: string) => (
  <HeroDropdownItem
    className={cn(itemClassName, item.className)}
    data-testid={item.testId || item.key}
    description={item.description}
    key={item.key}
    onPress={item.onClick}
    startContent={item.icon}
  >
    {item.label}
  </HeroDropdownItem>
);

/**
 * Dropdown menu component based on [HeroUI Dropdown](https://www.heroui.com//docs/components/dropdown)
 */
const Menu = ({
  ariaLabel = undefined,
  children = null,
  className: _className = undefined,
  isDisabled = false,
  items,
  onAction = undefined,
  placement = undefined,
  testId = undefined,
  triggerButtonProps = undefined,
}: MenuProps) => {
  // className from slots
  const variants = menuVariants();
  const className = variantsToClassNames(variants, _className, 'trigger');

  // determine trigger button variant
  let triggerButton = <button type="button">{children}</button>;
  if (!children) {
    //  default to ellipsis icon when no children are provided
    triggerButton = (
      <Button
        className={cn('min-w-0', className.trigger)}
        size="sm"
        variant="flat"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...triggerButtonProps}
      >
        <FaEllipsisVertical />
      </Button>
    );
  } else if (triggerButtonProps) {
    // use provided triggerButtonProps with hero button
    triggerButton = (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Button className={className.trigger} {...triggerButtonProps}>
        {children}
      </Button>
    );
  }

  return (
    <HeroDropdown
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      placement={placement}
    >
      <HeroDropdownTrigger data-testid={testId}>
        {/* NOTE: type and aria properties are injected by HeroDropdownTrigger */}
        {triggerButton}
      </HeroDropdownTrigger>
      <HeroDropdownMenu
        items={items}
        disabledKeys={getDisabledKeys(items)}
        onAction={onAction}
      >
        {(item) => {
          if ('items' in item) {
            return (
              <HeroDropdownSection
                items={item.items}
                title={item.label as HeroDropdownSectionProps['title']}
                key={item.key}
              >
                {(sectionItem) => {
                  return renderMenuItem(sectionItem, className.item);
                }}
              </HeroDropdownSection>
            );
          }
          return renderMenuItem(item, className.item);
        }}
      </HeroDropdownMenu>
    </HeroDropdown>
  );
};

export default Menu;
