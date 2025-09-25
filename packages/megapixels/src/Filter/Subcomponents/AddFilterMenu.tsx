import { FaSliders } from 'react-icons/fa6';

import Menu from '@fuf-stack/pixels/Menu';

import { useFilters } from './FiltersContext';

interface AddFilterMenuProps {
  /** CSS class name map for slots */
  classNames?: Partial<{
    addFilterMenuItem: string;
    addFilterMenuButton: string;
  }>;
}

/**
 * AddFilterMenu
 *
 * Renders a menu trigger that opens a list of addable filters. Selecting an
 * item triggers the parent to seed a default value and open the modal.
 */
const AddFilterMenu = ({ classNames = {} }: AddFilterMenuProps) => {
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
      isDisabled={!menuItems.length}
      items={menuItems}
      placement="bottom-start"
      className={{
        item: classNames.addFilterMenuItem,
        trigger: classNames.addFilterMenuButton,
      }}
      triggerButtonProps={{
        'aria-label': 'Add Filter',
        'data-testid': 'add_filter_button',
        disableRipple: true,
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
