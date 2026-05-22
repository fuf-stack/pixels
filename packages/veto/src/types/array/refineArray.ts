/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import type {
  VetoEffects,
  VetoOptional,
  VetoRefinementCtx,
  VetoTypeAny,
} from 'src/types';
import type { VArray, VArraySchema } from './array';

import { z } from 'zod';

import { issueCodes } from '../../issueCodes';

/**
 * Element type where object fields are optionalized.
 *
 * - Arrays are kept as-is.
 * - Object elements are made `Partial` so callbacks can still run when some
 *   properties are missing, which allows duplicate + validation errors together.
 * - Primitives are kept unchanged.
 */
type PartialObjectElement<TElement> = TElement extends readonly unknown[]
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
      /**
       * Custom message for the duplicate element error.
       *
       * @example
       * elementMessage: 'This id is already used'
       */
      elementMessage?: string;
      /**
       * Sub-path where the duplicate element error should be attached.
       *
       * @example
       * // Put the error on `data.fieldB` of the duplicate element
       * elementErrorPath: ['data', 'fieldB']
       */
      elementErrorPath?: string[];
      /**
       * Projects an element to a comparable value used for uniqueness checks.
       *
       * Returning `undefined` skips uniqueness comparison for that element
       * (it will never create a duplicate error on its own).
       *
       * @example
       * // Use object id for uniqueness
       * mapFn: (element) => element.id
       *
       * @example
       * // Only compare when nested value exists
       * mapFn: (element) => element.data?.fieldB
       *
       * @example
       * // Skip elements that are not "active"
       * mapFn: (element) => (element.active ? element.key : undefined)
       */
      mapFn?: (element: TElement) => unknown;
      /**
       * Custom message for the array-level duplicate error.
       *
       * @example
       * message: 'Each entry must be unique'
       */
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
    // map elements to comparable values; undefined means "ignore for uniqueness"
    const comparableEntries = data
      .map(({ element }, index) => {
        return {
          mapped: mapFn(element),
          index,
        };
      })
      .filter((entry): entry is { mapped: unknown; index: number } => {
        return entry.mapped !== undefined;
      });

    // add error to (second) duplicate array element
    const dataMapped = comparableEntries.map(({ mapped }) => {
      return mapped;
    });

    // find indexes of (second) duplicate elements in array
    const duplicateIndexes = dataMapped
      .map((elementMapped, i) => {
        const hasPreviousDuplicate = dataMapped.some(
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
        return hasPreviousDuplicate ? comparableEntries[i]?.index : false;
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
export interface VArrayCustomHelpers<TElement> {
  /**
   * Type guard against the array element schema.
   *
   * Pass `{ partial: true }` to allow partial object elements and narrow to
   * `Partial<TElement>` (objects only; primitives/arrays stay unchanged).
   */
  isElement: {
    (value: unknown): value is TElement;
    (
      value: unknown,
      options: { partial: true },
    ): value is PartialObjectElement<TElement>;
  };
  /**
   * Returns elements satisfying the element schema.
   *
   * Pass `{ partial: true }` to include partial object elements and get
   * `Partial<TElement>[]` typing (objects only; primitives/arrays unchanged).
   */
  validElements: {
    (values: unknown[]): TElement[];
    (
      values: unknown[],
      options: { partial: true },
    ): PartialObjectElement<TElement>[];
  };
}

/** Configuration options for array validation refinements */
export interface VArrayRefinements<TElement = unknown> {
  /**
   * Custom array refinement function.
   *
   * `elements` stays `unknown[]` because preprocess runs before full base parsing.
   * Use `helpers.isElement` / `helpers.validElements` for opt-in element-schema
   * validation + type-safe narrowing inside this callback.
   *
   * @example
   * // Run aggregate logic on schema-valid subset only
   * custom: (elements, ctx, helpers) => {
   *   const valid = helpers.validElements(elements);
   *   const total = valid.reduce((sum, item) => sum + item.score, 0);
   *   if (total > 100) {
   *     ctx.addIssue({ code: 'custom', message: 'Total score must be <= 100' });
   *   }
   * }
   *
   * @example
   * // Per-element check with full schema guard
   * custom: (elements, ctx, helpers) => {
   *   elements.forEach((item, index) => {
   *     if (helpers.isElement(item) && item.score < 0) {
   *       ctx.addIssue({
   *         code: 'custom',
   *         message: 'Score must be positive',
   *         path: [index, 'score'],
   *       });
   *     }
   *   });
   * }
   *
   * @example
   * // Partial mode for object schemas (missing fields allowed in guard)
   * custom: (elements, ctx, helpers) => {
   *   elements.forEach((item, index) => {
   *     if (helpers.isElement(item, { partial: true }) && item.id === undefined) {
   *       ctx.addIssue({
   *         code: 'custom',
   *         message: 'id is missing',
   *         path: [index, 'id'],
   *       });
   *     }
   *   });
   * }
   */
  custom?: (
    elements: unknown[],
    ctx: VetoRefinementCtx,
    helpers: VArrayCustomHelpers<TElement>,
  ) => void;
  /**
   * Ensures array elements are unique.
   *
   * @example
   * // Default uniqueness check
   * unique: true
   *
   * @example
   * // Compare objects by id
   * unique: { mapFn: (element) => element.id }
   *
   * @example
   * // Put duplicate error on nested field and customize messages
   * unique: {
   *   mapFn: (element) => element.data?.fieldB,
   *   elementErrorPath: ['data', 'fieldB'],
   *   elementMessage: 'Field must be unique',
   *   message: 'Array contains duplicates',
   * }
   */
  unique?: MakeElementsUniqueOptions<PartialObjectElement<TElement>>;
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
  type UniqueElementValue = PartialObjectElement<ElementValue>;

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
      const objectElementSchema = isObjectElementSchema(
        arrayBaseSchema.element,
      );
      const customHelpers: VArrayCustomHelpers<ElementValue> = {
        isElement: ((
          value: unknown,
          options?: { partial: true },
        ): value is ElementValue | PartialObjectElement<ElementValue> => {
          if (options?.partial) {
            return objectElementSchema
              ? isPlainObject(value)
              : arrayBaseSchema.element.safeParse(value).success;
          }
          return arrayBaseSchema.element.safeParse(value).success;
        }) as VArrayCustomHelpers<ElementValue>['isElement'],
        validElements: ((
          values: unknown[],
          options?: { partial: true },
        ): (ElementValue | PartialObjectElement<ElementValue>)[] => {
          if (options?.partial) {
            return values.filter(
              (value): value is PartialObjectElement<ElementValue> => {
                return customHelpers.isElement(value, { partial: true });
              },
            );
          }
          return values.filter((value): value is ElementValue => {
            return customHelpers.isElement(value);
          });
        }) as VArrayCustomHelpers<ElementValue>['validElements'],
      };
      const refinementSchema = z.preprocess((val, ctx) => {
        // add custom refinement
        if (refinements.custom && Array.isArray(val)) {
          refinements.custom(val as unknown[], ctx, customHelpers);
        }
        // add unique refinement
        if (refinements.unique && Array.isArray(val)) {
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
                  element: parsedItem.data as UniqueElementValue,
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
