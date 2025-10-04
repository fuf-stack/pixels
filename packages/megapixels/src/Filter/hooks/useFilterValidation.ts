import type { VetoInstance, VetoRawShape, VetoTypeAny } from '@fuf-stack/veto';
import type { FilterInstance } from '../filters/types';

import { useMemo } from 'react';

import { object, string, stringToJSON, veto } from '@fuf-stack/veto';

/**
 * useFilterValidation
 *
 * Builds a composite validation schema from all provided filter definitions
 * under "filter" and optionally includes a "search" string field.
 * Memoized by inputs.
 */
export const useFilterValidation = (
  filters: FilterInstance<unknown, unknown>[],
  withSearch?: boolean,
) => {
  return useMemo<VetoInstance>(() => {
    // build filter validation
    let filterSchema: Record<string, VetoTypeAny> = {};
    filters.forEach((f) => {
      filterSchema = {
        ...filterSchema,
        [f.name]: f.validation(f.config) as VetoTypeAny,
      };
    });

    const validationSchema: VetoRawShape = {
      // filter validation
      filter: stringToJSON()
        .pipe(object(filterSchema))
        .or(object(filterSchema))
        .optional()
        .nullable()
        // transform null to undefined
        .transform((val) => {
          return val ?? undefined;
        }),
      // optional search validation
      ...(withSearch
        ? { search: string({ min: 0 }).nullable().optional() }
        : {}),
    };

    return veto(validationSchema);
  }, [filters, withSearch]);
};

export default useFilterValidation;
