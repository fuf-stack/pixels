import type { ReactNode } from 'react';

/**
 * FilterDefinition
 *
 * Declarative description of a filter. A FilterDefinition is not used
 * directly by the UI. Instead, it is passed to `createFilter` to produce a
 * concrete, runtime `FilterInstance` for a specific usage (with name/icon and
 * optional config overrides).
 *
 * @typeParam Config - The configuration object shape for this filter
 * @typeParam Value  - The runtime value type produced/consumed by this filter
 */
export interface FilterDefinition<Config, Value> {
  components: {
    /**
     * Display component rendered inside the filter chip. Receives the current
     * filter `value` and the merged `config`.
     */
    Display: (props: { value: Value; config: Config }) => ReactNode;
    /**
     * Form component rendered inside the modal. Receives the fully-qualified
     * field name and the merged, validated `config`.
     */
    Form: (props: { fieldName: string; config: Config }) => ReactNode;
  };
  defaults: {
    /** Baseline configuration for the filter; can be overridden per usage */
    config: Config;
    /** Initial form value seeded when a filter is added */
    value: Value;
  };
  /**
   * Validation factory returning an ex-validator schema for the value shape.
   * Receives the (merged) `config` so the schema can depend on configuration.
   */
  validation: (config?: Config) => unknown;
}

/**
 * FilterFactory
 *
 * A filter exports a factory that, given name/icon and optional config
 * overrides, returns a concrete FilterInstance with merged config and a
 * computed defaultValue.
 *
 * @typeParam Config - Configuration object shape for the filter
 * @typeParam Value  - Runtime value type for the filter
 */
export type FilterFactory<Config, Value> = (args: {
  /** Per-usage configuration overrides merged with `defaults.config` */
  config?: Partial<Config>;
  /** Optional icon element shown in menus/labels */
  icon?: ReactNode;
  /** Logical field name under `filter.{name}` */
  name: string;
}) => FilterInstance<Config, Value>;

/**
 * FilterInstance
 *
 * Runtime instance created by merging a filter's defaults with usage
 * overrides and attaching name/icon for UI.
 *
 * This is the only shape used by the rendering layer and context.
 *
 * @typeParam Config - Effective configuration object shape
 * @typeParam Value  - Effective value type for the filter
 */
export interface FilterInstance<Config, Value> {
  /** UI components (Form/Display) provided by the filter */
  components: FilterDefinition<Config, Value>['components'];
  /** Merged configuration (`defaults.config` overlaid with per-usage overrides) */
  config: Config;
  /** Initial form value to seed when adding this filter */
  defaultValue: Value;
  /** Optional icon element used in menus/labels */
  icon?: ReactNode;
  /** Logical field name under `filter.{name}` */
  name: string;
  /** ex-validator schema factory for the value; typically closure over config */
  validation: (config?: Config) => unknown;
}

/**
 * FiltersConfiguration
 *
 * Top-level collection of instantiated filters used by the Filter component
 * and FiltersContext. Each entry is a concrete FilterInstance (already created
 * via a filter factory), carrying its merged config, default value, UI
 * components, and validate function.
 */
export type FiltersConfiguration = FilterInstance<any, any>[];

/**
 * FilterDisplayProps
 *
 * Props provided to a filter's Display component. Derived from an active
 * FilterInstance at runtime.
 *
 * @typeParam Config - Effective configuration type for the instance
 * @typeParam Value  - Effective value type for the instance
 */
export interface FilterDisplayProps<Config, Value> {
  /** Merged configuration for the filter instance */
  config: Config;
  /** Current (possibly partial) value for the filter instance */
  value: Value;
}

/**
 * FilterFormProps
 *
 * Props provided to a filter's Form component. The `fieldName` is the
 * fully-qualified path in the host form, and the `config` is the instance's
 * merged configuration.
 *
 * @typeParam Config - Effective configuration type for the instance
 */
export interface FilterFormProps<Config> {
  /** Merged configuration for the filter instance */
  config: Config;
  /** Fully-qualified form field path (e.g., `filter.status`) */
  fieldName: string;
}
