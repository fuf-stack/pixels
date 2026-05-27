import type { ZodType } from 'zod';

import { z } from 'zod';

/** Any schema branch accepted by `and(...)`. */
type VAndSchema = z.ZodTypeAny;

/** `and(...)` requires at least two schema branches. */
type VAndSchemaList = [VAndSchema, VAndSchema, ...VAndSchema[]];

/** Tuple of branch output types in schema order. */
type TupleOutputs<TSchemas extends readonly VAndSchema[]> = {
  [K in keyof TSchemas]: z.output<TSchemas[K]>;
};

/** Tuple of branch input types in schema order. */
type TupleInputs<TSchemas extends readonly VAndSchema[]> = {
  [K in keyof TSchemas]: z.input<TSchemas[K]>;
};

/** Reduces a tuple into an intersection of all item types. */
type IntersectTuple<TValues extends readonly unknown[]> =
  TValues extends readonly [infer THead, ...infer TTail]
    ? THead & IntersectTuple<TTail>
    : unknown;

/** Result schema that intersects input/output types across all branches. */
type VAndResultSchema<TSchemas extends VAndSchemaList> = ZodType<
  IntersectTuple<TupleOutputs<TSchemas>>,
  IntersectTuple<TupleInputs<TSchemas>>
>;

/**
 * Creates an intersection schema from two or more schemas.
 *
 * @example
 * const schema = and(z.object({ a: z.string() }), z.object({ b: z.number() }));
 * schema.parse({ a: 'x', b: 1 });
 */
export const and = <TSchemas extends VAndSchemaList>(
  ...schemas: TSchemas
): VAndResultSchema<TSchemas> => {
  const [firstSchema, secondSchema, ...remainingSchemas] = schemas;

  let schema = z.intersection(firstSchema, secondSchema);
  remainingSchemas.forEach((currentSchema) => {
    schema = z.intersection(schema, currentSchema);
  });

  return schema as VAndResultSchema<TSchemas>;
};

export type VAnd = typeof and;
