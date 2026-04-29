import type {
  VetoEffects,
  VetoOptional,
  VetoRawShape,
  VetoRefinementCtx,
  VetoTypeAny,
} from 'src/types';
import type { ZodObject } from 'zod';

import { z } from 'zod';

/**
 * Creates a strict object schema.
 *
 * Unknown keys are rejected.
 *
 * @example
 * const schema = object({ name: z.string() });
 * schema.parse({ name: 'Ada' });
 *
 * @see https://zod.dev/?id=strict
 */
export const object = <T extends VetoRawShape>(schema: T): VObjectSchema<T> => {
  // expect objects to be strict (disallow unknown keys)
  return z.strictObject(schema);
};

export type VObject = typeof object;
export type VObjectSchema<T extends VetoRawShape> = ZodObject<T>;

/**
 * Creates a non-strict object schema.
 *
 * Unknown keys are allowed.
 *
 * @example
 * const schema = objectLoose({ name: z.string() });
 * schema.parse({ name: 'Ada', extra: true });
 *
 * @see https://zod.dev/?id=objects
 */
export const objectLoose = <T extends VetoRawShape>(
  schema: T,
): VObjectLooseSchema<T> => {
  return z.object(schema);
};

export type VObjectLoose = typeof objectLoose;
export type VObjectLooseSchema<T extends VetoRawShape> = ZodObject<T>;

/** Configuration options for object validation refinements */
export interface VObjectRefinements {
  /** Custom refinement function that takes the object data and context */
  custom: (data: Record<string, unknown>, ctx: VetoRefinementCtx) => void;
}

type RefineObjectInputObject =
  | ReturnType<VObject>
  | ReturnType<VObjectLoose>
  | VetoOptional<ReturnType<VObject>>
  | VetoOptional<ReturnType<VObjectLoose>>;

// Extract the shape type by handling both direct object schema and VetoOptional wrapped schema
type ExtractShape<T> =
  T extends VetoOptional<VetoTypeAny>
    ? ExtractShape<ReturnType<T['unwrap']>>
    : T extends { shape: VetoRawShape }
      ? T['shape']
      : never;

/**
 * Applies custom validation refinements to an object schema.
 *
 * Implementation detail: this composes two branches with an intersection:
 * - the original object schema branch (produces built-in nested field errors)
 * - a permissive branch that only runs `custom` checks
 *
 * This allows veto to surface both base schema issues (e.g. missing required
 * nested fields) and object-level cross-field issues from `custom` in one pass.
 * Without this split, Zod v4 can drop one side depending on parse continuity.
 *
 * @param schema - Base object schema to refine. Can be either:
 *   - A direct object schema (ReturnType<VObject | VObjectLoose>)
 *   - A wrapped optional object schema (VetoOptional<ReturnType<VObject | VObjectLoose>>)
 * @returns Function that takes refinement options and returns an enhanced schema
 *
 * @example
 * ```ts
 * const schema = refineObject(object({ name: string() }))({
 *   custom: (val, ctx) => {
 *     if (val.name === 'invalid') {
 *       ctx.addIssue({
 *         code: 'custom',
 *         message: 'Name cannot be "invalid"',
 *       });
 *     }
 *   }
 * });
 * ```
 */
export const refineObject = <T extends RefineObjectInputObject>(schema: T) => {
  type Shape = ExtractShape<T>;

  return (
    refinements: VObjectRefinements,
  ): VetoEffects<VObjectSchema<Shape>> => {
    // Run custom object-level refinement on a permissive branch, then
    // intersect with the base schema so we keep nested field errors too.
    const customBranch = z.preprocess((val, ctx) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
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

        refinements.custom(val as Record<string, unknown>, refinementsCtx);
      }

      return val;
    }, z.any());

    const _schema = z.intersection(schema, customBranch) as VetoEffects<
      VObjectSchema<Shape>
    >;

    return _schema;
  };
};
