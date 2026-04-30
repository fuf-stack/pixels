import type { VRecordSchema } from '../record/record';

import { z } from 'zod';

/**
 * Recursive type representing any valid JSON value.
 */
export type JsonAll = string | number | boolean | null | JsonObject | JsonAll[];

/**
 * Type representing a JSON object with string keys and JSON values.
 */
export interface JsonObject {
  [key: string]: JsonAll;
}

/**
 * Creates a validator for any JSON value.
 * @returns veto schema for validating any JSON value
 *
 * @example
 * ```typescript
 * const validator = json();
 * const data = { foo: [1, "bar", { baz: true }] };
 * const result = validator.parse(data);
 * ```
 */
export const json = (): VJsonSchema => {
  return z.json();
};

/**
 * Type representing the JSON validator function
 */
export type VJson = typeof json;
export type VJsonSchema = ReturnType<typeof z.json>;

/**
 * Creates a validator specifically for JSON objects
 * Ensures the input is an object (not an array or primitive)
 * @see https://www.w3schools.com/js/js_json_objects.asp
 *
 * @returns veto schema for validating JSON objects
 *
 * @example
 * ```typescript
 * const validator = jsonObject();
 * const data = { foo: { bar: [1, 2, 3] } };
 * const result = validator.parse(data);
 * // Will fail for non-objects: arrays, primitives, etc.
 * ```
 */
export const jsonObject = (): VJsonObjectSchema => {
  return z.record(z.string(), json(), {
    error: (issue) => {
      if (issue.input === undefined) {
        return 'Field is required';
      }
      if (issue.code === 'invalid_type') {
        return 'Invalid json object';
      }
      return undefined;
    },
  });
};

/**
 * Type representing the JSON object validator function
 */
export type VJsonObject = typeof jsonObject;
export type VJsonObjectSchema = VRecordSchema<VJsonSchema>;

/**
 * Transforms a JSON string into its parsed JavaScript value
 *
 * Handles standard JSON types (strings, numbers, booleans, null, objects, arrays)
 * and rejects malformed JSON, JavaScript-specific values (undefined, BigInt),
 * and non-JSON formats.
 *
 * @returns veto schema that parses JSON strings into JavaScript values
 *
 * @example
 * // Basic usage
 * const result = stringToJSON().parse('{"name":"John","age":30}');
 *
 * // With additional validation using pipe
 * const userSchema = stringToJSON().pipe(z.object({ name: z.string() }));
 * const user = userSchema.parse('{"name":"Alice"}');
 */
export const stringToJSON = () => {
  return z.string().transform((str, ctx): JsonAll => {
    try {
      const parsed: unknown = JSON.parse(str);
      return parsed as JsonAll;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  });
};
