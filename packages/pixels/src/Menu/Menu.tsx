import type { DropdownSectionProps } from '@heroui/dropdown';
import type { Key, MouseEventHandler, ReactNode } from 'react';

import { FaEllipsisVertical } from 'react-icons/fa6';

import { Button } from '@heroui/button';
import {
  Dropdown as HeroDropdown,
  DropdownItem as HeroDropdownItem,
  DropdownMenu as HeroDropdownMenu,
  DropdownSection as HeroDropdownSection,
  DropdownTrigger as HeroDropdownTrigger,
} from '@heroui/dropdown';

import { cn } from '@fuf-stack/pixel-utils';

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
  onClick?: MouseEventHandler<HTMLLIElement>;
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

export interface MenuProps {
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string | string[];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** menu item structure */
  items: (MenuSection | MenuItem)[];
  /** disable menu trigger */
  isDisabled?: boolean;
  /** called if item is selected */
  onAction?: (key: Key) => void;
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

const renderMenuItem = (item: MenuItem) => (
  <HeroDropdownItem
    className={item.className}
    data-testid={item.testId || item.key}
    description={item.description}
    key={item.key}
    onClick={item.onClick}
    startContent={item.icon}
  >
    {item.label}
  </HeroDropdownItem>
);

/**
 * Dropdown menu component based on [HeroUI Dropdown](https://www.heroui.com//docs/components/dropdown)
 */
const Menu = ({
  children = null,
  className = undefined,
  onAction = undefined,
  testId = undefined,
  isDisabled = false,
  items,
}: MenuProps) => {
  return (
    <HeroDropdown isDisabled={isDisabled}>
      <HeroDropdownTrigger className={cn(className)} data-testid={testId}>
        {children ? (
          // eslint-disable-next-line react/button-has-type
          <button>{children}</button>
        ) : (
          // INFO: we use hero button here so that ref passing works
          <Button size="sm" variant="flat" className="min-w-0">
            <FaEllipsisVertical />
          </Button>
        )}
      </HeroDropdownTrigger>
      <HeroDropdownMenu
        // aria-label="Dynamic Actions"
        items={items}
        disabledKeys={getDisabledKeys(items)}
        onAction={onAction}
      >
        {(item) => {
          if ('items' in item) {
            return (
              <HeroDropdownSection
                items={item.items as MenuSection['items']}
                title={item.label as DropdownSectionProps['title']}
                key={item.key}
              >
                {(sectionItem) => {
                  return renderMenuItem(sectionItem);
                }}
              </HeroDropdownSection>
            );
          }
          return renderMenuItem(item);
        }}
      </HeroDropdownMenu>
    </HeroDropdown>
  );
};

export default Menu;
