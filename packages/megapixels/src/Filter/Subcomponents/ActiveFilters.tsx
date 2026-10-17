import { tv } from '@fuf-stack/pixel-utils';
import { Label } from '@fuf-stack/pixels/Label';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { useFilters } from './FiltersContext';

/** Layout of the edit action inside an active filter label */
const activeFilterTriggerVariants = tv({
  base: 'flex items-center gap-2',
});

interface ActiveFiltersProps {
  /** CSS class name */
  className?: string;
}

/** Active filter labels with separate edit and removal actions */
const ActiveFilters = ({ className = undefined }: ActiveFiltersProps) => {
  const styling = useStyling();
  const {
    activeFilters,
    getFilterValueByName,
    getFilterInstanceByName,
    hasError,
    removeFilter,
    showFilterModal,
  } = useFilters();

  // className for the edit action
  const triggerClassName = styling.resolve(activeFilterTriggerVariants);

  return (
    <>
      {activeFilters.map((name) => {
        const instance = getFilterInstanceByName(name);
        const value = getFilterValueByName(name);

        // get the display component from the instance
        const DisplayComponent = instance.components.Display;

        // open this filter for editing
        const handleOpen = () => {
          showFilterModal(name);
        };

        // remove this filter without opening its editor
        const handleRemove = () => {
          removeFilter(name);
        };

        return (
          <Label
            key={name}
            className={className}
            color={hasError(name) ? 'danger' : 'primary'}
            onClose={handleRemove}
            variant="flat"
          >
            <button
              aria-label={`Open ${name} filter`}
              className={triggerClassName}
              onClick={handleOpen}
              type="button"
            >
              {instance.icon}
              <DisplayComponent config={instance.config} value={value} />
            </button>
          </Label>
        );
      })}
    </>
  );
};

export default ActiveFilters;
