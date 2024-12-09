import type {
  VetoEffects,
  VetoOptional,
  VetoRawShape,
  VetoRefinementCtx,
  VetoTypeAny,
} from 'src/types';
import type { object as looseObject, strictObject } from 'zod';

// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

/**
 * strict object
 * @see https://zod.dev/?id=strict
 */
export const object = <T extends VetoRawShape>(schema: T): VObjectSchema<T> =>
  z
    .object(schema)
    // expect objects to be strict (disallow unknown keys)
    .strict();

export type VObject = typeof object;
export type VObjectSchema<T extends VetoRawShape> = ReturnType<
  typeof strictObject<T>
>;

/** when used with refine or superRefine */
export type VObjectRefined<T extends VetoRawShape> = VetoEffects<
  VObjectSchema<T>
>;

/**
 * loose object
 * @see https://zod.dev/?id=objects
 */
export const objectLoose = <T extends VetoRawShape>(
  schema: T,
): VObjectLooseSchema<T> => z.object(schema);

export type VObjectLoose = typeof objectLoose;
export type VObjectLooseSchema<T extends VetoRawShape> = ReturnType<
  typeof looseObject<T>
>;

/** when used with refine or superRefine */
export type VObjectLooseRefined<T extends VetoRawShape> = VetoEffects<
  VObjectLooseSchema<T>
>;

/** Configuration options for object validation refinements */
type ObjectRefinements = {
  /** Custom refinement function that takes the object data and context */
  custom: (data: Record<string, unknown>, ctx: VetoRefinementCtx) => void;
};

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
 * Applies validation refinements to an object schema
 * @param schema - Base object schema to refine. Can be either:
 *   - A direct object schema (ReturnType<VObject | VObjectLoose>)
 *   - A wrapped optional object schema (VetoOptional<ReturnType<VObject | VObjectLoose>>)
 * @returns Function that takes refinement options and returns enhanced schema
 *
 * @example
 * ```ts
 * const schema = refineObject(object({ name: string() }))({
 *   custom: (val, ctx) => {
 *     if (val.name === 'invalid') {
 *       ctx.addIssue({
 *         code:  'custom',
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
    refinements: ObjectRefinements,
  ): VetoEffects<VObjectSchema<Shape>> => {
    // Add custom refinement
    const _schema = z.preprocess((val, ctx) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        refinements.custom(val as Record<string, unknown>, ctx);
      }
      return val;
    }, schema) as VetoEffects<VObjectSchema<Shape>>;

    return _schema;
  };
};
