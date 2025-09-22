import type { FilterDefinition, FilterFactory } from './types';

/**
 * createFilter
 *
 * Builds a filter factory from a static FilterDefinition. The returned factory
 * accepts a usage descriptor (name/icon and optional partial config) and
 * produces a concrete FilterInstance with:
 * - merged config (shallow: definition.defaults.config overlaid by overrides)
 * - Form/Display components
 * - validate function (forwarded from the definition)
 * - defaultValue (forwarded from the definition)
 * - name and icon for UI integration
 *
 * @typeParam Config - Configuration object shape for the filter
 * @typeParam Value  - Runtime value type for the filter
 * @param definition - Static description of the filter (components, defaults, validate)
 * @returns FilterFactory that creates FilterInstance<Config, Value>
 */
const createFilter = <Config, Value>(
  definition: FilterDefinition<Config, Value>,
): FilterFactory<Config, Value> => {
  return ({ name, icon, config }) => {
    return {
      components: definition.components,
      config: { ...definition.defaults.config, ...(config ?? {}) } as Config,
      defaultValue: definition.defaults.value,
      icon,
      name,
      validation: definition.validation,
    };
  };
};

export default createFilter;
