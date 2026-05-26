import type {
  VetoEffects,
  VetoOptional,
  VetoRawShape,
  VetoRefinementCtx,
  VetoTypeAny,
} from 'src/types';
import type { VObject, VObjectLoose, VObjectSchema } from './object';

import { z } from 'zod';

type PartialObjectData<TData> = TData extends object ? Partial<TData> : TData;

/**
 * Helper utilities passed to `refineObject(...){ custom }`.
 *
 * These helpers allow opt-in schema checks with type-safe narrowing inside the
 * custom callback, while the callback input stays permissive during preprocess.
 */
export interface VObjectCustomHelpers<TData> {
  /**
   * Type guard against the object schema.
   *
   * @example
   * if (helpers.isSchemaObject(data) && data.role === 'admin') { ... }
   *
   * @example
   * // Partial mode allows missing keys for object schemas
   * if (
   *   helpers.isSchemaObject(data, { partial: true }) &&
   *   data.email === undefined
   * ) { ... }
   */
  isSchemaObject: {
    (value: unknown): value is TData;
    (
      value: unknown,
      options: { partial: true },
    ): value is PartialObjectData<TData>;
  };
  /**
   * Parses a value with the object schema.
   *
   * @example
   * const parsed = helpers.parseObject(data);
   * if (parsed) {
   *   // parsed is fully typed object
   * }
   */
  parseObject: {
    (value: unknown): TData | null;
    (
      value: unknown,
      options: { partial: true },
    ): PartialObjectData<TData> | null;
  };
}

/** Configuration options for object validation refinements */
export interface VObjectRefinements<TData = Record<string, unknown>> {
  /**
   * Custom refinement function.
   *
   * `data` stays `Record<string, unknown>` because preprocess runs before full
   * base parsing. Use `helpers` for opt-in schema validation and type narrowing.
   *
   * @example
   * // Full object guard
   * custom: (data, ctx, helpers) => {
   *   if (
   *     helpers.isSchemaObject(data) &&
   *     data.role === 'admin' &&
   *     data.age < 18
   *   ) {
   *     ctx.addIssue({
   *       code: 'custom',
   *       message: 'Admin must be 18 or older',
   *       path: ['age'],
   *     });
   *   }
   * }
   *
   * @example
   * // Partial mode for missing-field checks
   * custom: (data, ctx, helpers) => {
   *   if (
   *     helpers.isSchemaObject(data, { partial: true }) &&
   *     data.email === undefined
   *   ) {
   *     ctx.addIssue({
   *       code: 'custom',
   *       message: 'Email is missing',
   *       path: ['email'],
   *     });
   *   }
   * }
   *
   * @param data Preprocess-time object input (record-shaped, not fully typed).
   * @param ctx Refinement context used to add validation issues.
   * @param helpers Type-safe guards/parsers for full or partial object checks.
   */
  custom: (
    data: Record<string, unknown>,
    ctx: VetoRefinementCtx,
    helpers: VObjectCustomHelpers<TData>,
  ) => void;
}

/**
 * Input schema shape accepted by `refineObject`.
 *
 * Supports both direct and optional-wrapped object schemas.
 */
type RefineObjectInputObject =
  | ReturnType<VObject>
  | ReturnType<VObjectLoose>
  | VetoOptional<ReturnType<VObject>>
  | VetoOptional<ReturnType<VObjectLoose>>;

/**
 * Maps an input object schema to the refined output schema type while
 * preserving optionality.
 *
 * - optional object in -> optional refined object out
 * - non-optional object in -> non-optional refined object out
 */
type RefineObjectOutput<T extends RefineObjectInputObject> =
  T extends VetoOptional<infer TObjectSchema>
    ? TObjectSchema extends VObjectSchema<infer TShape extends VetoRawShape>
      ? VetoEffects<VetoOptional<VObjectSchema<TShape>>>
      : never
    : T extends VObjectSchema<infer TShape extends VetoRawShape>
      ? VetoEffects<VObjectSchema<TShape>>
      : never;

// Extract shape type for direct and optional-wrapped object schemas.
type ExtractShape<T> =
  T extends VetoOptional<VetoTypeAny>
    ? ExtractShape<ReturnType<T['unwrap']>>
    : T extends { shape: VetoRawShape }
      ? T['shape']
      : never;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Applies custom validation refinements to an object schema.
 *
 * Implementation detail: custom checks run in a permissive preprocess branch
 * that is intersected with the original object schema.
 *
 * This allows veto to surface both base schema issues and object-level custom
 * issues in one pass.
 *
 * @example
 * ```ts
 * const schema = refineObject(object({ name: string(), age: number() }))({
 *   custom: (data, ctx, helpers) => {
 *     if (
 *       helpers.isSchemaObject(data) &&
 *       data.name === 'admin' &&
 *       data.age < 18
 *     ) {
 *       ctx.addIssue({ code: 'custom', message: 'Admin must be 18 or older' });
 *     }
 *   },
 * });
 * ```
 */
export const refineObject = <T extends RefineObjectInputObject>(schema: T) => {
  type Shape = ExtractShape<T>;
  type ObjectData = z.infer<VObjectSchema<Shape>>;
  type PartialData = PartialObjectData<ObjectData>;

  return (
    refinements: VObjectRefinements<ObjectData>,
  ): RefineObjectOutput<T> => {
    // Keep optional key presence semantics by unwrapping before intersection.
    const isOptionalSchema = schema instanceof z.ZodOptional;
    const baseSchema = isOptionalSchema
      ? (schema as VetoOptional<VetoTypeAny>).unwrap()
      : (schema as VetoTypeAny);

    const objectBaseSchema = baseSchema as VObjectSchema<Shape>;
    const partialObjectSchema = objectBaseSchema.partial();

    const customHelpers: VObjectCustomHelpers<ObjectData> = {
      isSchemaObject: ((
        value: unknown,
        options?: { partial: true },
      ): value is ObjectData | PartialData => {
        if (options?.partial) {
          return partialObjectSchema.safeParse(value).success;
        }
        return objectBaseSchema.safeParse(value).success;
      }) as VObjectCustomHelpers<ObjectData>['isSchemaObject'],
      parseObject: ((
        value: unknown,
        options?: { partial: true },
      ): ObjectData | PartialData | null => {
        if (options?.partial) {
          const parsedPartial = partialObjectSchema.safeParse(value);
          return parsedPartial.success
            ? (parsedPartial.data as PartialData)
            : null;
        }
        const parsedFull = objectBaseSchema.safeParse(value);
        return parsedFull.success ? parsedFull.data : null;
      }) as VObjectCustomHelpers<ObjectData>['parseObject'],
    };

    // Run custom object-level refinement in a permissive branch and combine it
    // with the base object branch so base and custom issues are both surfaced.
    const customBranch = z.preprocess((val, ctx) => {
      if (isRecord(val)) {
        const refinementsCtx = {
          ...ctx,
          addIssue: (issue: Parameters<typeof ctx.addIssue>[0]) => {
            if (typeof issue === 'string') {
              ctx.addIssue(issue);
              return;
            }
            ctx.addIssue({
              ...issue,
              continue: issue.continue ?? true,
            });
          },
        } as VetoRefinementCtx;

        refinements.custom(val, refinementsCtx, customHelpers);
      }

      return val;
    }, z.any());

    const refinedBaseSchema = z.intersection(baseSchema, customBranch).pipe(
      // Re-parse merged intersection output so base object semantics stay
      // authoritative for result data and strict unknown-key behavior.
      baseSchema,
    ) as VetoEffects<VObjectSchema<Shape>>;

    if (isOptionalSchema) {
      return refinedBaseSchema.optional() as unknown as RefineObjectOutput<T>;
    }

    return refinedBaseSchema as unknown as RefineObjectOutput<T>;
  };
};
