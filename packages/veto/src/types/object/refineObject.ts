import type {
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
   * `data` is the value produced by the base schema's parse step (so e.g.
   * `string().trim()` fields are already trimmed). It is typed as
   * `Record<string, unknown>` because some fields may have failed validation
   * and contain pre-parse / fallback values; use `helpers` for opt-in,
   * type-safe schema checks against `data`.
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
      ? VetoOptional<VObjectSchema<TShape>>
      : never
    : T extends VObjectSchema<infer TShape extends VetoRawShape>
      ? VObjectSchema<TShape>
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
 * Adds object-level custom validation to an object schema.
 *
 * The `custom` callback runs alongside the base schema's own checks, so any
 * issues it adds appear in the same error result as field-level issues. Use
 * it for rules that depend on multiple fields at once (e.g. "field A is
 * required when field B is 'x'").
 *
 * In the callback, `data` is the value produced by the base schema (e.g.
 * strings are already `.trim()`-ed). Use `helpers.isSchemaObject` /
 * `helpers.parseObject` for type-safe narrowing — fields that failed the
 * base schema may still be present but hold their pre-parse value.
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
    // Keep optional key presence semantics by unwrapping before refinement and
    // re-wrapping at the end.
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

    // Attach the custom callback as a `superRefine` check on the base schema.
    // The `when: () => true` override ensures the check runs even after base
    // parsing produced (non-fatal) issues, so users see base AND custom
    // errors in a single pass.
    //
    // Keeping the result type as the original object schema preserves zod's
    // strict / passthrough semantics and veto's serialized-schema-based error
    // formatter (which uses object-likeness to decide between `_errors`
    // nesting and flat error arrays).
    const refinedBaseSchema = objectBaseSchema.superRefine(
      (data: unknown, ctx: z.RefinementCtx) => {
        if (!isRecord(data)) {
          return;
        }
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
        refinements.custom(data, refinementsCtx, customHelpers);
      },
      {
        when: () => {
          return true;
        },
      },
    );

    if (isOptionalSchema) {
      return refinedBaseSchema.optional() as unknown as RefineObjectOutput<T>;
    }

    return refinedBaseSchema as unknown as RefineObjectOutput<T>;
  };
};
