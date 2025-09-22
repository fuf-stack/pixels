import type { VetoTypeAny } from '@fuf-stack/veto';
import type { FilterInstance } from '../filters/types';

import { useMemo } from 'react';

import { object, string, stringToJSON, veto } from '@fuf-stack/veto';

/** Validation function return type alias. */
type ValidationSchema = ReturnType<typeof veto>;

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
  return useMemo<ValidationSchema>(() => {
    let validationObject: Record<string, VetoTypeAny> = {};
    let filterValidation: Record<string, VetoTypeAny> = {};

    filters.forEach((f) => {
      filterValidation = {
        ...filterValidation,
        [f.name]: f.validation(f.config),
      };
    });

    validationObject = {
      filter: stringToJSON()
        .pipe(object(filterValidation))
        .or(object(filterValidation))
        .optional(),
      ...(withSearch
        ? { search: string({ min: 0 }).nullable().optional() }
        : {}),
    };

    return veto(validationObject);
  }, [filters, withSearch]);
};

export default useFilterValidation;
