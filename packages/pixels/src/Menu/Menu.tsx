import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ButtonProps } from '@heroui/button';
import type {
  DropdownItemProps as HeroDropdownItemProps,
  DropdownProps as HeroDropdownProps,
  DropdownSectionProps as HeroDropdownSectionProps,
} from '@heroui/dropdown';
import type { Key, ReactNode } from 'react';

import { Button } from '@heroui/button';
import {
  Dropdown as HeroDropdown,
  DropdownItem as HeroDropdownItem,
  DropdownMenu as HeroDropdownMenu,
  DropdownSection as HeroDropdownSection,
  DropdownTrigger as HeroDropdownTrigger,
} from '@heroui/dropdown';

import { useReducedMotion } from '@fuf-stack/pixel-motion';
import { cn, slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import VerticalDotsIcon from './VerticalDotsIcon';

/**
 * Menu component based on [HeroUI Dropdown](https://www.heroui.com//docs/components/dropdown)
 */
export interface MenuItem {
  /** unique identifier */
  key: string;
  /** CSS class name */
  className?: string;
  /** Slot name for styling/debugging hooks */
  dataSlot?: string;
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
  /** plain-text value used for type-to-select when the label is not plain text */
  textValue?: string;
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
    trigger: 'z-auto',
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
  /** disables the open/close popover animation (also auto-disabled when the user prefers reduced motion) */
  disableAnimation?: boolean;
  /** menu item structure */
  items: (MenuSection | MenuItem)[];
  /** disable menu trigger */
  isDisabled?: boolean;
  /** placement of the menu */
  placement?: HeroDropdownProps['placement'];
  /** container the popover portal is rendered into (defaults to document.body) */
  portalContainer?: HeroDropdownProps['portalContainer'];
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
    | 'disableRipple'
    | 'disabled'
    | 'size'
    | 'variant'
  > & { 'data-testid'?: string; dataSlot?: string };
}

// type guard for MenuSection
const isMenuSection = (item: MenuSection | MenuItem): item is MenuSection => {
  return 'items' in item;
};

// returns String[] of disabled items/keys
const getDisabledKeys = (items: (MenuSection | MenuItem)[]): string[] => {
  const flatItems = items.reduce<MenuItem[]>((acc, item) => {
    if (isMenuSection(item)) {
      acc.push(...item.items);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  return flatItems
    .filter((item) => {
      return item.disabled === true;
    })
    .map((item) => {
      return item.key;
    });
};

const renderMenuItem = (item: MenuItem, itemClassName?: string) => {
  return (
    <HeroDropdownItem
      key={item.key}
      className={cn(itemClassName, item.className)}
      data-slot={item.dataSlot}
      data-testid={slugify(item.testId ?? item.key)}
      description={item.description}
      onPress={item.onClick}
      startContent={item.icon}
      textValue={item.textValue}
    >
      {item.label}
    </HeroDropdownItem>
  );
};

/**
 * Dropdown menu component based on [HeroUI Dropdown](https://www.heroui.com//docs/components/dropdown)
 */
const Menu = ({
  ariaLabel = undefined,
  children = null,
  className: _className = undefined,
  disableAnimation = false,
  isDisabled = false,
  items,
  onAction = undefined,
  placement = undefined,
  portalContainer = undefined,
  testId = undefined,
  triggerButtonProps = undefined,
}: MenuProps) => {
  // className from slots
  const variants = menuVariants();
  const className = variantsToClassNames(variants, _className, 'trigger');

  // disable popover animation when requested or when the user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  const shouldDisableAnimation = disableAnimation || !!prefersReducedMotion;

  // determine trigger button variant
  let triggerButton = (
    <button className={className.trigger} type="button">
      {children}
    </button>
  );
  if (!children) {
    //  default to ellipsis icon when no children are provided
    triggerButton = (
      <Button
        className={cn('min-w-0 outline outline-divider', className.trigger)}
        isIconOnly
        radius="full"
        size="sm"
        variant="light"
        {...triggerButtonProps}
      >
        <VerticalDotsIcon />
      </Button>
    );
  } else if (triggerButtonProps) {
    // use provided triggerButtonProps with hero button
    triggerButton = (
      <Button className={className.trigger} {...triggerButtonProps}>
        {children}
      </Button>
    );
  }

  return (
    <HeroDropdown
      aria-label={ariaLabel}
      disableAnimation={shouldDisableAnimation}
      isDisabled={isDisabled}
      placement={placement}
      portalContainer={portalContainer}
    >
      <HeroDropdownTrigger data-testid={testId}>
        {/* NOTE: type and aria properties are injected by HeroDropdownTrigger */}
        {triggerButton}
      </HeroDropdownTrigger>
      <HeroDropdownMenu
        disabledKeys={getDisabledKeys(items)}
        items={items}
        onAction={onAction}
      >
        {(item) => {
          if ('items' in item) {
            return (
              <HeroDropdownSection
                key={item.key}
                items={item.items}
                title={item.label as HeroDropdownSectionProps['title']}
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
