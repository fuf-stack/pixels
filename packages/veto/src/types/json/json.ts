// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

/**
 * Base JSON Schema following JSON specification
 * @see https://zod.dev/?id=json-type
 * @see https://www.json.org/json-en.html
 */
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

/**
 * Type representing JSON primitive values (string, number, boolean, null)
 */
type Literal = z.infer<typeof literalSchema>;

/**
 * Type representing a JSON object with string keys and any valid JSON value
 * Keys must be strings as per JSON specification
 */
export type JsonObject = { [key: string]: JsonAll };

/**
 * Recursive type representing any valid JSON value:
 * - Primitive values (string, number, boolean, null)
 * - Objects with string keys and JSON values
 * - Arrays of JSON values
 */
export type JsonAll = Literal | JsonObject | JsonAll[];

/**
 * Represents a single level of JSON schema validation
 * Can be either:
 * - A literal (string, number, boolean, null)
 * - An array containing any valid deep JSON schema
 * - An object with string keys and deep JSON schema values
 */
type LevelJsonSchema =
  | typeof literalSchema
  | z.ZodArray<DeepJsonSchema>
  | z.ZodRecord<z.ZodString, DeepJsonSchema>;

/**
 * Represents a complete JSON schema that can validate nested structures
 * Extends LevelJsonSchema to include unions of schemas, allowing for
 * validation of deeply nested JSON structures
 */
type DeepJsonSchema =
  | LevelJsonSchema
  | z.ZodUnion<
      [
        typeof literalSchema,
        z.ZodArray<DeepJsonSchema>,
        z.ZodRecord<z.ZodString, DeepJsonSchema>,
      ]
    >;

/**
 * Creates a schema validator for nested JSON structures
 * @param levels - Maximum number of nesting levels to validate (default: 10)
 * @returns A veto schema that can validate JSON with the specified nesting depth
 *
 * @example
 * ```typescript
 * const schema = createDeepJsonSchema(3);
 * const validData = {
 *   a: [1, { b: [true, null] }],
 *   c: { d: "test" }
 * };
 * const result = schema.parse(validData);
 * ```
 */
const createDeepJsonSchema = (levels: number) => {
  let currentDeepSchema: DeepJsonSchema = literalSchema;

  for (let i = 0; i < levels; i += 1) {
    currentDeepSchema = z.union([
      literalSchema,
      z.array(currentDeepSchema),
      z.record(z.string(), currentDeepSchema),
    ]);
  }

  return currentDeepSchema;
};

/**
 * Creates a validator for any JSON value with specified nesting depth
 * @param levels - Maximum number of nesting levels to validate (default: 10)
 * @returns veto schema for validating any JSON value
 *
 * @example
 * ```typescript
 * const validator = json();
 * const data = { foo: [1, "bar", { baz: true }] };
 * const result = validator(levels).parse(data);
 * ```
 */
export const json = (levels = 10) =>
  createDeepJsonSchema(levels) as DeepJsonSchema;

/**
 * Type representing the JSON validator function
 */
export type VJson = typeof json;

/**
 * Creates a validator specifically for JSON objects
 * Ensures the input is an object (not an array or primitive)
 * @see https://www.w3schools.com/js/js_json_objects.asp
 *
 * @param levels - Maximum number of nesting levels to validate (default: 10)
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
export const jsonObject = (levels = 10) =>
  z.record(json(levels), { invalid_type_error: 'Invalid json object' });

/**
 * Type representing the JSON object validator function
 */
export type VJsonObject = typeof jsonObject;

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
export const stringToJSON = () =>
  z.string().transform((str, ctx): z.infer<ReturnType<typeof json>> => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  });
