import Label from '@fuf-stack/pixels/Label';

import { useFilters } from './FiltersContext';

/**
 * ActiveFilters
 *
 * Shows the list of currently applied filters as clickable chips that open
 * the edit modal. Each chip can be removed via its close action.
 */
const ActiveFilters = () => {
  const {
    activeFilters,
    getFilterValueByName,
    getFilterInstanceByName,
    hasError,
    removeFilter,
    showFilterModal,
  } = useFilters();
  return (
    <>
      {activeFilters.map((name) => {
        const instance = getFilterInstanceByName(name);
        const value = getFilterValueByName(name);

        // get the display component from the instance
        const DisplayComponent = instance.components.Display;

        return (
          <button
            key={name}
            aria-label={`Open ${name} filter`}
            type="button"
            onClick={() => {
              return void showFilterModal(name);
            }}
          >
            <Label
              className="dark:text-foreground h-8 cursor-pointer"
              color={hasError(name) ? 'danger' : 'primary'}
              variant="flat"
              onClose={() => {
                removeFilter(name);
              }}
            >
              {instance.icon}
              {DisplayComponent ? (
                <DisplayComponent config={instance.config} value={value} />
              ) : null}
            </Label>
          </button>
        );
      })}
    </>
  );
};

export default ActiveFilters;
