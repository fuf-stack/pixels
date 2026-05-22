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

/**
 * Creates an array schema from an element schema.
 *
 * @example
 * const schema = array(string()).min(1);
 * schema.parse(['value']);
 */
export const array: <T extends VetoTypeAny>(schema: T) => VArraySchema<T> =
  z.array;

export type VArray = typeof array;
export type VArraySchema<T extends VetoTypeAny> = ZodArray<T>;

/** when used with refine or superRefine */
export type VArrayRefined<T extends VetoTypeAny> = VetoEffects<VArraySchema<T>>;

/**
 * Type of element passed to `unique.mapFn`.
 *
 * - Arrays are kept as-is.
 * - Object elements are made `Partial` so mapFn can still run when some
 *   properties are missing, which allows duplicate + validation errors together.
 * - Primitives are kept unchanged.
 */
type UniqueMapFnInput<TElement> = TElement extends readonly unknown[]
  ? TElement
  : TElement extends object
    ? Partial<TElement>
    : TElement;

/**
 * Options for `refineArray(...){ unique: ... }`.
 *
 * When `true`, a default deep-ish comparison is used.
 * When object options are provided, `mapFn` can project each element into a
 * comparable value and custom messages/paths can be configured.
 */
type MakeElementsUniqueOptions<TElement = unknown> =
  | true
  | {
      /** custom error method in single element is not unique (element) */
      elementMessage?: string;
      /** a custom error (sub-)path that allows creating the element is not unique error on a sub field */
      elementErrorPath?: string[];
      /** helper to transform array elements before comparing them */
      mapFn?: (element: TElement) => unknown;
      /** custom error method in case elements are not unique (global) */
      message?: string;
    };

/** Refinement to make array elements unique */
const makeElementsUnique = <TElement>(
  options: MakeElementsUniqueOptions<TElement>,
) => {
  return (
    data: { element: TElement; index: number }[],
    ctx: VetoRefinementCtx,
  ) => {
    const mapFn =
      (options !== true && options?.mapFn) ||
      ((x: TElement) => {
        return x;
      });
    // add error to (second) duplicate array element
    const dataMapped = data.map(({ element }) => {
      return mapFn(element);
    });

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
    duplicateIndexes.forEach((mappedIndex) => {
      const originalIndex = data[mappedIndex]?.index;
      if (originalIndex === undefined) {
        return;
      }
      ctx.addIssue({
        code: issueCodes.custom,
        message:
          (options !== true && options?.elementMessage) ||
          'Element already exists',
        params: { code: 'not_unique' },
        // add element path
        path: [
          originalIndex,
          ...((options !== true && options?.elementErrorPath) || []),
        ],
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

/** Narrow unknown values to non-array object literals. */
const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
};

/**
 * Best-effort check whether an element schema represents an object value.
 *
 * This is used to decide if object-like raw values should still be passed to
 * `unique.mapFn` (for partial-object duplicate checks), even when full element
 * validation would fail because some required keys are missing.
 */
const isObjectElementSchema = (schema: VetoTypeAny): boolean => {
  if (schema instanceof z.ZodObject) {
    return true;
  }
  const probeResult = schema.safeParse({});
  if (probeResult.success) {
    return false;
  }
  return probeResult.error.issues.some((issue) => {
    return issue.path.length > 0;
  });
};

/** Configuration options for array validation refinements */
export interface VArrayRefinements<TElement = unknown> {
  /** Custom refinement function that takes the object data and context */
  custom?: (data: unknown[], ctx: VetoRefinementCtx) => void;
  /** Ensures array elements are unique based on specified criteria or comparison function */
  unique?: MakeElementsUniqueOptions<UniqueMapFnInput<TElement>>;
}

/**
 * Input schema shape accepted by `refineArray`.
 *
 * Supports both:
 * - direct array schemas
 * - optional-wrapped array schemas
 */
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
  type ElementValue = z.infer<Element>;
  type UniqueElementValue = UniqueMapFnInput<ElementValue>;

  return (
    refinements: VArrayRefinements<ElementValue>,
  ): VetoEffects<VArraySchema<Element>> => {
    let _schema = schema as unknown as VetoEffects<VArraySchema<Element>>;

    // Zod >=4.4 treats "key presence" separately from "value validity".
    // If we intersect an optional array schema directly, the resulting wrapper
    // can lose top-level optional semantics when used in object shapes, causing
    // missing keys to be treated as required.
    //
    // To keep optional object fields stable across Zod versions, unwrap first,
    // apply intersection on the inner array schema, then re-apply .optional().
    const isOptionalSchema = schema instanceof z.ZodOptional;
    const baseSchema = isOptionalSchema
      ? (schema as VetoOptional<VetoTypeAny>).unwrap()
      : (schema as VetoTypeAny);

    // if refinements provided
    if (Object.keys(refinements).length) {
      const arrayBaseSchema = baseSchema as VArraySchema<Element>;
      const refinementSchema = z.preprocess((val, ctx) => {
        // add custom refinement
        if (refinements.custom && Array.isArray(val)) {
          refinements.custom(val as unknown[], ctx);
        }
        // add unique refinement
        if (refinements.unique && Array.isArray(val)) {
          const objectElementSchema = isObjectElementSchema(
            arrayBaseSchema.element,
          );
          const validElements = val
            .map(
              (
                item,
                index,
              ): { element: UniqueElementValue; index: number } | null => {
                if (objectElementSchema) {
                  if (!isPlainObject(item)) {
                    return null;
                  }
                  return {
                    element: item as UniqueElementValue,
                    index,
                  };
                }
                const parsedItem = arrayBaseSchema.element.safeParse(item);
                if (!parsedItem.success) {
                  return null;
                }
                return {
                  element: parsedItem.data,
                  index,
                };
              },
            )
            .filter(
              (
                item,
              ): item is { element: UniqueElementValue; index: number } => {
                return item !== null;
              },
            );
          makeElementsUnique(refinements.unique)(validElements, ctx);
        }
        return val;
      }, z.any());

      // In Zod v4 preprocess issues can short-circuit downstream parsing.
      // Intersecting with the original schema keeps base validation issues
      // and custom refinement issues in the final error result.
      const refinedBaseSchema = z.intersection(
        baseSchema,
        refinementSchema,
      ) as VetoEffects<VArraySchema<Element>>;

      // Re-wrap optional at the outermost layer so object property presence
      // checks still see this field as optional.
      _schema = isOptionalSchema
        ? (refinedBaseSchema.optional() as VetoEffects<VArraySchema<Element>>)
        : refinedBaseSchema;
    }

    return _schema;
  };
};
