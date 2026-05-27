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

export type VOrErrorResolver = (value: unknown) => string | undefined;

export interface VOrOptions {
  /**
   * Optional custom error message for failed union validation.
   *
   * - When a `string` is provided, `or` checks every branch and returns one
   *   `custom` issue with this message if none validate.
   * - When a function is provided, it is called with the raw input value so you
   *   can return different messages based on it (e.g. `'Field is required'`
   *   for `undefined`, otherwise a format-specific message). Returning
   *   `undefined` falls back to native `z.union` behavior, keeping branch-level
   *   errors.
   * - When omitted, `or` behaves like `z.union` and keeps branch-level errors.
   */
  error?: string | VOrErrorResolver;
}

/**
 * Type guard distinguishing a trailing {@link VOrOptions} object from a schema.
 *
 * Zod schemas expose `safeParse`, so we reject anything that looks like a
 * schema and accept either an empty object (for forward-compat) or one that
 * carries the known `error` key.
 */
const isOrOptions = (value: unknown): value is VOrOptions => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('safeParse' in value) &&
    ('error' in value || Object.keys(value).length === 0)
  );
};

/**
 * Resolves the final error message for a failed union validation.
 *
 * - String `error` is returned as-is.
 * - Function `error` is invoked with the raw input value; its return value
 *   (string or `undefined`) is forwarded so callers can choose to fall back
 *   to native union errors by returning `undefined`.
 */
const resolveErrorMessage = (
  error: VOrOptions['error'],
  value: unknown,
): string | undefined => {
  if (typeof error === 'function') {
    return error(value);
  }
  return error;
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
 *
 * @example
 * const schema = or(string().min(3), number().min(10), {
 *   error: (value) => {
 *     if (value === undefined || value === null || value === '') {
 *       return 'Field is required';
 *     }
 *     return 'Value must match the expected format';
 *   },
 * });
 */
export function or<TSchemas extends VOrSchemaList>(
  ...schemas: TSchemas
): VOrResultSchema<TSchemas>;
export function or<TSchemas extends VOrSchemaList>(
  ...schemasAndOptions: [...schemas: TSchemas, options: VOrOptions]
): VOrResultSchema<TSchemas>;
export function or(...schemasAndOptions: unknown[]): ZodType {
  const values = [...schemasAndOptions];
  const maybeOptions = values[values.length - 1];
  const options = isOrOptions(maybeOptions)
    ? (values.pop() as VOrOptions)
    : undefined;
  const schemas = values as VOrSchema[];

  if (schemas.length < 2) {
    throw new Error('or(...) expects at least 2 schemas');
  }

  const union = z.union(schemas as [VOrSchema, VOrSchema, ...VOrSchema[]]);

  if (!options?.error) {
    return union;
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

    const message = resolveErrorMessage(options.error, value);

    if (message === undefined) {
      const fallback = union.safeParse(value);
      if (!fallback.success) {
        fallback.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: 'custom',
            message: issue.message,
            path: issue.path,
          });
        });
      }
      return value;
    }

    ctx.addIssue({
      code: 'custom',
      message,
    });

    return value;
  }, z.any());
}

export type VOr = typeof or;
