import type { VetoInput } from '@fuf-stack/veto';
import type { ReactNode } from 'react';
import type { FiltersConfiguration } from './filters/types';
import type { ClassName } from './filterVariants';
import type { SearchConfiguration } from './subcomponents/SearchInput';

import createDebug from 'debug';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { filterVariants } from './filterVariants';
import { useFilterValidation } from './hooks/useFilterValidation';
import FilterControl from './subcomponents/FilterControl';

export { filterVariants } from './filterVariants';

const debug = createDebug('megapixels:Filter');

export interface FilterValues {
  filter?: string | Record<string, unknown> | null;
  search?: string;
}

export type FilterChildRenderFn = (values: {
  search?: string;
  filter?: Record<string, unknown>;
}) => ReactNode;

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
  /** Disables the add-filter menu and modal open/close animations */
  disableAnimation?: boolean;
  /** Uniform form instance name. Defaults to "filterComponentForm". */
  formName?: string;
  /** Controlled setter invoked on submit with the next canonical values */
  onChange: (nextValues: FilterValues) => void;
  /**
   * Container the add-filter menu and filter modal portals render into.
   * Defaults to document.body; set this to keep portals scoped to a parent
   * (e.g. for embedding or deterministic snapshot tests).
   */
  portalContainer?: HTMLElement;
  /** Controlled committed state: the canonical `search` and `filter` values */
  values: FilterValues;
}

/**
 * Configurable search and filter controls for narrowing a result set
 *
 * Shows active filters with actions to add, edit and remove them using the
 * configured filter registry and validation schemas
 *
 * Edits stay in the form until submission, which commits changes through
 * `onChange`. The parent controls committed state through `values`
 * Optional render-prop children receive the resolved search and filter values
 */
const Filter = ({
  children = undefined,
  className = undefined,
  config,
  disableAnimation = false,
  formName = 'filterComponentForm',
  onChange,
  portalContainer = undefined,
  values,
}: FilterProps) => {
  const styling = useStyling();

  // combine filter schemas with the optional search field
  const validation = useFilterValidation(
    config.filters,
    Boolean(config.search),
  );

  // validate controlled values are valid
  const {
    data: valuesValidated,
    errors,
    success,
  } = validation.validate(values as VetoInput);

  // classNames from slots
  const variants = styling.resolve(filterVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  debug('render', {
    props: { config, values },
    validation: { errors, success, valuesValidated },
  });

  return (
    <FilterControl
      className={classNames}
      config={config}
      disableAnimation={disableAnimation}
      formName={formName}
      onChange={onChange}
      portalContainer={portalContainer}
      validation={validation}
      values={valuesValidated ?? {}}
    >
      {children}
    </FilterControl>
  );
};

export default Filter;
