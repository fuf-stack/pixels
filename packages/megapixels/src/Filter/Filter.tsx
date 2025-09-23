import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { VetoInput } from '@fuf-stack/veto';
import type { ReactNode } from 'react';
import type { FiltersConfiguration } from './filters/types';
import type { SearchConfiguration } from './Subcomponents/SearchInput';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import Form from '@fuf-stack/uniform/Form';

import { useFilterValidation } from './hooks/useFilterValidation';
import ActiveFilters from './Subcomponents/ActiveFilters';
import AddFilterMenu from './Subcomponents/AddFilterMenu';
import FilterModal from './Subcomponents/FilterModal';
import { FiltersContextProvider } from './Subcomponents/FiltersContext';
import SearchInput from './Subcomponents/SearchInput';

// filter styling variants
export const filterVariants = tv({
  slots: {
    // outer wrapper
    base: '',
    // add filter menu trigger button
    addFilterMenuButton: '',
    // add filter menu item
    addFilterMenuItem: '',
    // active filter label
    activeFilterLabel: 'dark:text-foreground h-8 cursor-pointer rounded-md',
    // filter modal body
    filterModalBody: '',
    // filter modal header
    filterModalHeader: 'text-default-700 flex items-center gap-3',
    // filter modal footer
    filterModalFooter: 'justify-between',
    // form element
    form: 'mb-3 flex flex-wrap gap-3',
    // search input field
    searchInput: '',
    // search input wrapper (inner control)
    searchInputWrapper: '',
    // search motion container
    searchMotionDiv: 'flex w-72 gap-2',
    // search show button
    searchShowButton: '',
    // search submit button
    searchSubmitButton: '',
    // search wrapper
    searchWrapper: 'flex items-center',
  },
});

type ClassName = TVClassName<typeof filterVariants>;

export interface FilterValues {
  search?: string;
  filter?: string | Record<string, unknown>;
}

export type FilterChildRenderFn = (values: FilterValues) => ReactNode;

/**
 * Filter
 *
 * Controlled, form-driven filter UI.
 *
 * Responsibilities
 * - Derives initial form values from the controlled `values` prop
 * - Builds a composite validation schema from the filter registry (and optional search)
 * - Exposes ergonomic UI: active filters list, add/remove actions, and per-filter modal
 * - Commits changes by invoking the controlled `onChange` callback on submit
 *
 * Structure
 * - Owns an ex-forms `Form` that wraps the entire filter experience
 * - Optionally renders a search input bound to the `search` field
 * - Renders ActiveFilters, AddFilterMenu, and FilterModal inside a shared context
 * - Optionally renders children as a render-prop with the resolved `values`
 */
export interface FilterProps {
  /** Optional render-prop that receives the resolved, controlled values */
  children?: FilterChildRenderFn;
  /** CSS class name */
  className?: ClassName;
  /** Configuration of the filter */
  config: {
    /**
     * Declarative filter configuration. Each entry ties a logical name to a
     * registry filter type and (optionally) per-usage config overrides.
     */
    filters: FiltersConfiguration;
    /** Optional configuration for search field */
    search?: SearchConfiguration;
  };
  /** ex-forms form instance name. Defaults to "filterComponentForm". */
  formName?: string;
  /** Controlled setter invoked on submit with the next canonical values */
  onChange: (nextValues: FilterValues) => void;
  /** Controlled committed state: the canonical `search` and `filter` values */
  values: FilterValues;
}

/**
 * Renders the filter UI bound to a single ex-forms `Form`.
 * The form is the source of truth during user interaction; the committed
 * state is controlled by the parent via `values`/`onChange`.
 */
const Filter = ({
  children = undefined,
  className = undefined,
  config,
  formName = 'filterComponentForm',
  onChange,
  values,
}: FilterProps) => {
  // Submit handler: map form state back into the controlled `values` shape
  const handleSubmit = (nextValues: Record<string, unknown>) => {
    onChange(nextValues as FilterValues);
  };

  // Build validation schema for all configured filters (and optional search)
  const validation = useFilterValidation(
    config.filters,
    Boolean(config.search),
  );

  // validate controlled values are valid
  const { data: valuesValidated } = validation.validate(values as VetoInput);

  // classNames from slots
  const variants = filterVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <div className={classNames.base}>
      {/*
        Uniform Form wrapper
        - initialValues derive from controlled props (with optional defaults)
        - validation is built from the registry for all configured filters
        - onSubmit maps form values back into values/onChange
      */}
      <Form
        className={classNames.form}
        // disable debug mode for now
        debug={{ disable: true }}
        initialValues={valuesValidated ?? {}}
        name={formName}
        onSubmit={handleSubmit}
        validation={validation}
      >
        {/* Render search if search config is provided */}
        {config.search ? (
          <SearchInput
            config={config.search}
            classNames={{
              searchInput: classNames.searchInput,
              searchInputWrapper: classNames.searchInputWrapper,
              searchMotionDiv: classNames.searchMotionDiv,
              searchShowButton: classNames.searchShowButton,
              searchSubmitButton: classNames.searchSubmitButton,
              searchWrapper: classNames.searchWrapper,
            }}
          />
        ) : null}
        {/*
          FiltersContextProvider exposes a minimal API for the UI layer:
          - activeFilters/unusedFilters by name
          - helpers to get merged config, value, components, and field names
          - methods to add/remove filters and show/close the modal
        */}
        <FiltersContextProvider config={config.filters}>
          <ActiveFilters className={classNames.activeFilterLabel} />
          <AddFilterMenu
            classNames={{
              addFilterMenuButton: classNames.addFilterMenuButton,
              addFilterMenuItem: classNames.addFilterMenuItem,
            }}
          />
          <FilterModal
            classNames={{
              body: classNames.filterModalBody,
              footer: classNames.filterModalFooter,
              header: classNames.filterModalHeader,
            }}
          />
        </FiltersContextProvider>
      </Form>
      {/* Children can consume derived search string and parsed filter object */}
      {children?.(valuesValidated ?? {})}
    </div>
  );
};

export default Filter;
