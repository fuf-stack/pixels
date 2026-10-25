import type { FilterChildRenderFn, FilterProps } from '../Filter';
import type { FilterClassNames } from '../filterVariants';
import type { useFilterValidation } from '../hooks/useFilterValidation';

import createDebug from 'debug';

import Form from '@fuf-stack/uniform/Form';

import ActiveFilters from './ActiveFilters';
import AddFilterMenu from './AddFilterMenu';
import FilterModal from './FilterModal';
import { FiltersContextProvider } from './FiltersContext';
import SearchInput from './SearchInput';

const debug = createDebug('megapixels:Filter');

interface FilterControlProps extends Omit<FilterProps, 'className' | 'values'> {
  /** Resolved CSS class names */
  className: FilterClassNames;
  /** Combined filter and search schema */
  validation: ReturnType<typeof useFilterValidation>;
  /** Parsed values used to initialize the form and render children */
  values: Parameters<FilterChildRenderFn>[0];
}

/** Search, active filter actions and modal editing inside their bound form */
const FilterControl = ({
  children = undefined,
  className: classNames,
  config,
  disableAnimation = undefined,
  formName = undefined,
  onChange,
  portalContainer = undefined,
  validation,
  values,
}: FilterControlProps) => {
  // commit validated form values to the controlled owner
  const handleSubmit = (nextValues: Record<string, unknown>) => {
    debug('handleSubmit', { nextValues });
    onChange(nextValues);
  };

  return (
    <div className={classNames.base} data-component="filter">
      {/* bound search and filter form */}
      <Form
        className={{ form: classNames.form }}
        // disable debug mode for now
        debug={{ disable: true }}
        initialValues={values ?? {}}
        name={formName}
        onSubmit={handleSubmit}
        // the FilterModal footer's SubmitButton is portalled OUTSIDE this form's
        // dOM subtree, so it associates with the form via the native `form`
        // attribute (SubmitButton `remoteFormId`) instead of DOM descent
        remoteFormId={formName}
        validation={validation}
      >
        {/* optional search */}
        {config.search ? (
          <SearchInput
            className={{
              searchInput: classNames.searchInput,
              searchInputWrapper: classNames.searchInputWrapper,
              searchMotionDiv: classNames.searchMotionDiv,
              searchShowButton: classNames.searchShowButton,
              searchSubmitButton: classNames.searchSubmitButton,
              searchWrapper: classNames.searchWrapper,
            }}
            config={config.search}
          />
        ) : null}
        {/* active filters, add menu and modal editing */}
        <FiltersContextProvider config={config.filters}>
          <ActiveFilters className={classNames.activeFilterLabel} />
          <AddFilterMenu
            className={{
              addFilterMenuButton: classNames.addFilterMenuButton,
              addFilterMenuItem: classNames.addFilterMenuItem,
            }}
            disableAnimation={disableAnimation}
            portalContainer={portalContainer}
          />
          <FilterModal
            className={{
              body: classNames.filterModalBody,
              footer: classNames.filterModalFooter,
              header: classNames.filterModalHeader,
            }}
            disableAnimation={disableAnimation}
            portalContainer={portalContainer}
            remoteFormId={formName}
          />
        </FiltersContextProvider>
      </Form>
      {/* controlled results */}
      {children?.(values ?? {})}
    </div>
  );
};

export default FilterControl;
