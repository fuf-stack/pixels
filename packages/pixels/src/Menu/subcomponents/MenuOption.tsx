import type { MenuItemProps as AriaMenuItemProps } from 'react-aria-components';
import type { MenuItem } from '../Menu';
import type { MenuClassNames } from '../menuVariants';

import { MenuItem as AriaMenuItem, Text } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';

import { useStyling } from '../../StylingProvider';

interface MenuOptionProps {
  /** CSS class name */
  className: MenuClassNames;
  /** Action content, identity and callback */
  item: MenuItem;
}

/**
 * Menu action preserving press callbacks across pointer and keyboard activation
 *
 * @see https://react-aria.adobe.com/Menu
 */
const MenuOption = ({ className: classNames, item }: MenuOptionProps) => {
  const styling = useStyling();

  // keyboard actions close on keydown, before a release press can be delivered
  const handlePressStart: AriaMenuItemProps['onPressStart'] = (event) => {
    if (event.pointerType === 'keyboard') {
      item.onClick?.(event);
    }
  };

  const handlePress: AriaMenuItemProps['onPress'] = (event) => {
    if (event.pointerType !== 'keyboard') {
      item.onClick?.(event);
    }
  };

  return (
    <AriaMenuItem
      className={styling.cn(classNames.item, item.className)}
      data-slot={item.dataSlot}
      data-testid={slugify(item.testId ?? item.key)}
      id={item.key}
      isDisabled={item.disabled}
      onPress={handlePress}
      onPressStart={handlePressStart}
      textValue={
        item.textValue ??
        (typeof item.label === 'string' ? item.label : undefined)
      }
    >
      {item.icon}
      {item.description ? (
        <div className={classNames.labelWrapper}>
          <Text className={classNames.label} slot="label">
            {item.label}
          </Text>
          <Text className={classNames.description} slot="description">
            {item.description}
          </Text>
        </div>
      ) : (
        <Text className={classNames.label} slot="label">
          {item.label}
        </Text>
      )}
    </AriaMenuItem>
  );
};

export default MenuOption;
