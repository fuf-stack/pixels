import type { ZodType } from 'zod';

import { z } from 'zod';

/** Any schema branch accepted by `or(...)`. */
type VOrSchema = z.ZodTypeAny;

/** `or(...)` requires at least two schema branches. */
type VOrSchemaList = [VOrSchema, VOrSchema, ...VOrSchema[]];

/** Result schema that unions input/output types across all branches. */
type VOrResultSchema<TSchemas extends VOrSchemaList> = ZodType<
  z.output<TSchemas[number]>,
  z.input<TSchemas[number]>
>;

export interface VOrOptions {
  /**
   * Optional custom error message for failed union validation.
   *
   * - When set, `or` checks both branches and returns one `custom` issue
   *   with this message if neither branch validates.
   * - When omitted, `or` behaves like `z.union` and keeps branch-level errors.
   */
  error?: string;
}

const isOrOptions = (value: unknown): value is VOrOptions => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('safeParse' in value) &&
    ('error' in value || Object.keys(value).length === 0)
  );
};

/**
 * Creates a union schema from two or more schemas.
 *
 * @example
 * const schema = or(literal('A'), literal('B'));
 *
 * @example
 * const schema = or(literal('A'), literal('B'), literal('C'));
 *
 * @example
 * const schema = or(string().min(3), number().min(10), {
 *   error: 'Value must match at least one schema',
 * });
 */
export function or<TSchemas extends VOrSchemaList>(
  ...schemas: TSchemas
): VOrResultSchema<TSchemas>;
export function or<TSchemas extends VOrSchemaList>(
  ...schemasAndOptions: [...schemas: TSchemas, options: VOrOptions]
): VOrResultSchema<TSchemas>;
export function or(...schemasAndOptions: unknown[]): ZodType {
  const values = [...schemasAndOptions] as unknown[];
  const maybeOptions = values[values.length - 1];
  const options = isOrOptions(maybeOptions)
    ? (values.pop() as VOrOptions)
    : undefined;
  const schemas = values as VOrSchema[];

  if (schemas.length < 2) {
    throw new Error('or(...) expects at least 2 schemas');
  }

  if (!options?.error) {
    return z.union(schemas as [VOrSchema, VOrSchema, ...VOrSchema[]]);
  }

  return z.preprocess((value, ctx) => {
    const successfulResult = schemas
      .map((schema) => {
        return schema.safeParse(value);
      })
      .find((result) => {
        return result.success;
      });

    if (successfulResult?.success) {
      return successfulResult.data;
    }

    ctx.addIssue({
      code: 'custom',
      message: options.error,
    });

    return value;
  }, z.any());
}

export type VOr = typeof or;
