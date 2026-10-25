import type { Key } from 'react';
import type { MenuItem as MenuItemData, MenuProps } from '../Menu';
import type { MenuClassNames } from '../menuVariants';

import { Menu as AriaMenu, Header, MenuSection } from 'react-aria-components';

import MenuOption from './MenuOption';

interface MenuOptionsProps extends Pick<
  MenuProps,
  'ariaLabel' | 'items' | 'onAction'
> {
  /** CSS class name */
  className: MenuClassNames;
}

/**
 * Action collection with labelled groups, disabled options and typeahead text
 *
 * @see https://react-aria.adobe.com/Menu
 */
const MenuOptions = ({
  ariaLabel = undefined,
  className: classNames,
  items,
  onAction = undefined,
}: MenuOptionsProps) => {
  // keep the public callback limited to the selected key
  const handleAction = (key: Key) => {
    onAction?.(key);
  };

  const renderItem = (item: MenuItemData) => {
    return <MenuOption key={item.key} className={classNames} item={item} />;
  };

  return (
    <div className={classNames.menu}>
      <AriaMenu
        aria-label={ariaLabel}
        className={classNames.list}
        onAction={handleAction}
      >
        {items.map((item) => {
          if ('items' in item) {
            return (
              <MenuSection
                key={item.key}
                className={classNames.section}
                id={item.key}
              >
                <Header className={classNames.heading}>{item.label}</Header>
                {item.items.map(renderItem)}
              </MenuSection>
            );
          }
          return renderItem(item);
        })}
      </AriaMenu>
    </div>
  );
};

export default MenuOptions;
