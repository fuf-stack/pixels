import type { VetoTypeAny } from './types';

import { z } from 'zod';

// JSON Schema type from Zod v4's toJSONSchema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JSONSchema = Record<string, any>;

/**
 * Helper to check if a type includes a specific type name.
 * Handles both string type (e.g., "array") and array type (e.g., ["array", "null"])
 */
const typeIncludes = (
  jsonSchema: JSONSchema,
  typeName: string,
): boolean => {
  if (Array.isArray(jsonSchema.type)) {
    return jsonSchema.type.includes(typeName);
  }
  return jsonSchema.type === typeName;
};

// Type predicates for checking schema types in JSON Schema format
const isArrayType = (
  type: JSONSchema,
): type is JSONSchema & {
  type: 'array' | ['array', ...string[]];
  items: JSONSchema;
} => {
  return typeIncludes(type, 'array') && 'items' in type;
};

const isDiscriminatedUnionOrUnionType = (
  type: JSONSchema,
): type is JSONSchema & {
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
} => {
  // Zod v4 uses oneOf for discriminated unions, anyOf for regular unions
  return (
    ('anyOf' in type && Array.isArray(type.anyOf)) ||
    ('oneOf' in type && Array.isArray(type.oneOf))
  );
};

const isIntersectionType = (
  type: JSONSchema,
): type is JSONSchema & {
  allOf: JSONSchema[];
} => {
  return 'allOf' in type && Array.isArray(type.allOf);
};

const isObjectType = (
  type: JSONSchema,
): type is JSONSchema & {
  type: 'object' | ['object', ...string[]];
  properties: Record<string, JSONSchema>;
} => {
  return typeIncludes(type, 'object') && 'properties' in type;
};

const isRecordType = (
  type: JSONSchema,
): type is JSONSchema & {
  type: 'object' | ['object', ...string[]];
  additionalProperties: JSONSchema;
} => {
  return (
    typeIncludes(type, 'object') &&
    'additionalProperties' in type &&
    typeof type.additionalProperties === 'object'
  );
};

/**
 * Checks if a JSON Schema type is nullable.
 * Handles both:
 * - type array format: { type: ["string", "null"] }
 * - anyOf format: { anyOf: [{ type: "string" }, { type: "null" }] }
 */
const checkIsNullable = (jsonSchema: JSONSchema): boolean => {
  // Check type array format
  if (Array.isArray(jsonSchema.type) && jsonSchema.type.includes('null')) {
    return true;
  }
  // Check anyOf format (zod v4 uses this for nullable)
  if (Array.isArray(jsonSchema.anyOf)) {
    return jsonSchema.anyOf.some(
      (option: JSONSchema) => option.type === 'null',
    );
  }
  return false;
};

/**
 * Checks if a JSON Schema type is optional (represented as union with undefined-like schema).
 * In JSON Schema, optional is typically represented as anyOf with an empty schema {}
 */
const checkIsOptionalType = (jsonSchema: JSONSchema): boolean => {
  if (Array.isArray(jsonSchema.anyOf)) {
    // Check for empty schema {} which represents undefined in JSON Schema
    return jsonSchema.anyOf.some(
      (option: JSONSchema) =>
        Object.keys(option).length === 0 ||
        option.not !== undefined, // { not: {} } also represents never/undefined
    );
  }
  return false;
};

export const serializeSchema = (schema: VetoTypeAny): JSONSchema => {
  return z.toJSONSchema(schema, { unrepresentable: 'any' });
};

/**
 * Annotates a schema with isOptional and isNullable properties.
 * isOptional can come from:
 * - Parent context (property not in required array)
 * - Schema structure (anyOf with empty schema for undefined)
 */
const annotateSchema = (
  schema: JSONSchema,
  isOptionalFromContext: boolean,
): JSONSchema => ({
  ...schema,
  isOptional: isOptionalFromContext || checkIsOptionalType(schema),
  isNullable: checkIsNullable(schema),
});

/**
 * Traverses a schema path to find matching types
 * @param pathType - Current schema type being traversed
 * @param path - Path segments to traverse
 * @param isOptional - Whether the current path is optional (from parent context)
 * @returns Array of found schema types with isOptional/isNullable annotated
 */
const traverseSchemaPath = (
  pathType: JSONSchema,
  path: (string | number)[],
  isOptional = false,
): (JSONSchema | null)[] => {
  // Base case: end of path returns current type with annotations
  if (!path.length) {
    return [annotateSchema(pathType, isOptional)];
  }

  const [current, ...remainingPath] = path;

  if (isArrayType(pathType)) {
    const isIndex = Number.isInteger(current) || /^\d+$/.test(String(current));
    // Array items inherit optionality from the array itself
    return traverseSchemaPath(
      pathType.items,
      isIndex ? remainingPath : path,
      isOptional,
    );
  }

  if (isDiscriminatedUnionOrUnionType(pathType)) {
    // Zod v4 uses oneOf for discriminated unions, anyOf for regular unions
    const unionOptions = pathType.oneOf || pathType.anyOf;
    return unionOptions!.flatMap((option: JSONSchema) => {
      return traverseSchemaPath(option, path, isOptional);
    });
  }

  if (isIntersectionType(pathType)) {
    return pathType.allOf.flatMap((schema: JSONSchema) => {
      return traverseSchemaPath(schema, path, isOptional);
    });
  }

  if (isObjectType(pathType)) {
    const propertyKey = String(current);
    if (pathType.properties[propertyKey]) {
      // Check if property is optional by checking if it's NOT in the required array
      const requiredFields = (pathType.required as string[]) || [];
      const propertyIsOptional = !requiredFields.includes(propertyKey);

      return traverseSchemaPath(
        pathType.properties[propertyKey],
        remainingPath,
        propertyIsOptional,
      );
    }
    // Check if it's also a record type (object with additionalProperties)
    if (isRecordType(pathType)) {
      // Record properties are always optional (any key can be missing)
      return traverseSchemaPath(
        pathType.additionalProperties,
        remainingPath,
        true,
      );
    }
    // not found
    return [null];
  }

  if (isRecordType(pathType)) {
    // Record properties are always optional
    return traverseSchemaPath(pathType.additionalProperties, remainingPath, true);
  }

  // Default case: invalid path for current type
  return [null];
};

export type CheckSerializedSchemaPathCheckFunction = (
  pathType: JSONSchema | null,
) => boolean;

/**
 * Checks if a schema path satisfies a given condition by traversing the schema
 * structure and applying a check function to the found types.
 *
 * @param schema - The schema to check
 * @param checkFn - Function to evaluate each schema type
 * @param path - Optional path segments to traverse within the schema
 * @returns true if all valid path types satisfy the check function, false otherwise
 */
export const checkSerializedSchemaPath = (
  schema: VetoTypeAny,
  checkFn: CheckSerializedSchemaPathCheckFunction,
  path?: (string | number)[],
): boolean => {
  if (!schema) {
    return false;
  }
  const serialized = serializeSchema(schema);

  // If no path is provided or path is empty, check the root schema
  if (!path?.length) {
    return checkFn(serialized);
  }

  // Filter out null/undefined values and get valid types
  const validTypes = traverseSchemaPath(serialized, path).filter(
    (type): type is NonNullable<typeof type> => {
      return type != null;
    },
  );

  // Check if all valid types satisfy the check function if we have
  // valid types, otherwise return false
  return validTypes.length ? validTypes.every(checkFn) : false;
};
