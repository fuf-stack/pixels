import Filter from './Filter';
import { boolean } from './filters/boolean/boolean';
import { checkboxgroup } from './filters/checkboxgroup/checkboxgroup';

// export types
export type * from './filters/types';

// export helpers
export { default as createFilter } from './filters/createFilter';

// export all filters
export const filters = {
  boolean,
  checkboxgroup,
};

export default Filter;
