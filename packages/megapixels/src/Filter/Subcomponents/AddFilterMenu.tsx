import { FaSliders } from 'react-icons/fa6';
import { PiSlidersHorizontalBold } from 'react-icons/pi';

import { cn } from '@fuf-stack/pixel-utils';
import Menu from '@fuf-stack/pixels/Menu';

import { useFilters } from './FiltersContext';

interface AddFilterMenuProps {
  /** CSS class name */
  className?: string;
}

/**
 * AddFilterMenu
 *
 * Renders a menu trigger that opens a list of addable filters. Selecting an
 * item triggers the parent to seed a default value and open the modal.
 */
const AddFilterMenu = ({ className = undefined }: AddFilterMenuProps) => {
  const { unusedFilters, addFilter, getFilterInstanceByName } = useFilters();

  const menuItems = unusedFilters.map((name) => {
    const instance = getFilterInstanceByName(name);
    const config = instance.config as { text?: string };
    const label = config?.text ?? name;
    return {
      key: name,
      icon: instance.icon,
      label,
      onClick: () => {
        addFilter(name);
      },
    };
  });

  return (
    <Menu
      className={cn(className)}
      isDisabled={!menuItems.length}
      items={menuItems}
      placement="bottom-start"
      triggerButtonProps={{
        'aria-label': 'Add Filter',
        size: 'sm',
        variant: 'bordered',
      }}
    >
      <FaSliders />
      Filter
    </Menu>
  );
};

export default AddFilterMenu;
