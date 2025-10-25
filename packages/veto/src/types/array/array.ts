/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import type {
  VetoEffects,
  VetoOptional,
  VetoRefinementCtx,
  VetoTypeAny,
} from 'src/types';
import type { ZodArray } from 'zod';

import { z } from 'zod';

import { issueCodes } from '../../issueCodes';

export const array: <T extends VetoTypeAny>(schema: T) => ZodArray<T> = z.array;

export type VArray = typeof array;
export type VArraySchema<T extends VetoTypeAny> = ZodArray<T>;

/** when used with refine or superRefine */
export type VArrayRefined<T extends VetoTypeAny> = VetoEffects<VArraySchema<T>>;

type MakeElementsUniqueOptions =
  | true
  | {
      /** custom error method in single element is not unique (element) */
      elementMessage?: string;
      /** a custom error (sub-)path that allows creating the element is not unique error on a sub field */
      elementErrorPath?: string[];
      /** helper to transform array elements before comparing them */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapFn?: (arg: any) => any;
      /** custom error method in case elements are not unique (global) */
      message?: string;
    };

/** Refinement to make array elements unique */
const makeElementsUnique = (options: MakeElementsUniqueOptions) => {
  return <T extends VetoTypeAny>(data: T[], ctx: VetoRefinementCtx) => {
    const mapFn =
      (options !== true && options?.mapFn) ||
      ((x) => {
        return x;
      });
    // add error to (second) duplicate array element
    const dataMapped = data.map(mapFn);

    // find indexes of (second) duplicate elements in array
    const duplicateIndexes = dataMapped
      .map((elementMapped, i) => {
        const hasPreviousDuplicate = !!dataMapped.find(
          (otherMappedElement, otherI) => {
            if (
              // is same element (no duplicate)
              i === otherI ||
              // only return duplicate with higher index (second duplicate in array)
              i < otherI ||
              // check if elements are duplicates
              JSON.stringify(elementMapped) !==
                JSON.stringify(otherMappedElement)
            ) {
              return false;
            }
            // it is a (later) duplicate in array
            return true;
          },
        );
        return hasPreviousDuplicate ? i : false;
      })
      .filter((index) => {
        return index !== false;
      });
    // add element errors
    duplicateIndexes.forEach((i) => {
      ctx.addIssue({
        code: issueCodes.custom,
        message:
          (options !== true && options?.elementMessage) ||
          'Element already exists',
        params: { code: 'not_unique' },
        // add element path
        path: [i, ...((options !== true && options?.elementErrorPath) || [])],
      });
    });
    // add global _error to array
    if (duplicateIndexes.length) {
      ctx.addIssue({
        code: issueCodes.custom,
        message:
          (options !== true && options?.message) ||
          'Array elements are not unique',
        params: { type: 'array', code: 'not_unique' },
      });
    }
  };
};

/** Configuration options for array validation refinements */
export interface VArrayRefinements {
  /** Custom refinement function that takes the object data and context */
  custom?: (data: unknown[], ctx: VetoRefinementCtx) => void;
  /** Ensures array elements are unique based on specified criteria or comparison function */
  unique?: MakeElementsUniqueOptions;
}

type RefineArrayInputArray =
  | ReturnType<VArray>
  | VetoOptional<ReturnType<VArray>>;

// Extract the element type by handling both direct array schema and VetoOptional wrapped schema
type ExtractElement<T> =
  T extends VetoOptional<VetoTypeAny>
    ? ExtractElement<ReturnType<T['unwrap']>>
    : T extends { element: unknown }
      ? T['element']
      : never;

/**
 * Applies validation refinements to an array schema
 * @param schema - Base array schema to refine. Can be either:
 *   - A direct array schema (ReturnType<VArray>)
 *   - A wrapped optional array schema (VetoOptional<ReturnType<VArray>>)
 * @returns Function that takes refinement options and returns enhanced schema
 *
 * @example
 * ```ts
 * // Add unique validation
 * const schema = refineArray(array(string()))({
 *   unique: true
 * });
 *
 * // Add custom validation
 * const schema = refineArray(array(string()))({
 *   custom: (val, ctx) => {
 *     if (val.length < 2) {
 *       ctx.addIssue({
 *         code: 'custom',
 *         message: 'Array must have at least 2 elements'
 *       });
 *     }
 *   }
 * });
 * ```
 */
export const refineArray = <T extends RefineArrayInputArray>(schema: T) => {
  type Element = ExtractElement<T>;

  return (
    refinements: VArrayRefinements,
  ): VetoEffects<VArraySchema<Element>> => {
    let _schema = schema as unknown as VetoEffects<VArraySchema<Element>>;

    // if refinements provided
    if (Object.keys(refinements).length) {
      _schema = z.preprocess((val, ctx) => {
        // add custom refinement
        if (refinements.custom && Array.isArray(val)) {
          refinements.custom(val as unknown[], ctx);
        }
        // add unique refinement
        if (refinements.unique && Array.isArray(val)) {
          makeElementsUnique(refinements.unique)(val, ctx);
        }
        return val;
      }, schema) as VetoEffects<VArraySchema<Element>>;
    }

    return _schema;
  };
};
