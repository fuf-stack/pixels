import Filter from './Filter';
import { boolean } from './filters/boolean/boolean';
import { checkboxes } from './filters/checkboxes/checkboxes';

// export types
export type * from './filters/types';

// export helpers
export { default as createFilter } from './filters/createFilter';

// export all filters
export const filters = {
  boolean,
  checkboxes,
};

// export everything from the Filter component (types and filterVariants)
export * from './Filter';

// export the Filter component as default
export default Filter;
