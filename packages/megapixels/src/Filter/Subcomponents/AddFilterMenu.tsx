import { FaSliders } from 'react-icons/fa6';

import Menu from '@fuf-stack/pixels/Menu';

import { useFilters } from './FiltersContext';

interface AddFilterMenuProps {
  /** CSS class name map for slots */
  classNames?: Partial<{
    addFilterMenuItem: string;
    addFilterMenuButton: string;
  }>;
  /** disables the menu open/close animation */
  disableAnimation?: boolean;
  /** container the menu popover portal is rendered into (defaults to document.body) */
  portalContainer?: HTMLElement;
}

/**
 * AddFilterMenu
 *
 * Renders a menu trigger that opens a list of addable filters. Selecting an
 * item triggers the parent to seed a default value and open the modal.
 */
const AddFilterMenu = ({
  classNames = {},
  disableAnimation = false,
  portalContainer = undefined,
}: AddFilterMenuProps) => {
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
      className={{
        item: classNames.addFilterMenuItem,
        trigger: classNames.addFilterMenuButton,
      }}
      disableAnimation={disableAnimation}
      isDisabled={!menuItems.length}
      items={menuItems}
      placement="bottom-start"
      portalContainer={portalContainer}
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
