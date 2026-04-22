import type { VetoTypeAny } from './types';

import { z } from 'zod';

/**
 * JSON Schema-shaped type returned by {@link serializeSchema}.
 *
 * This is intentionally a structural subset of JSON Schema covering the fields
 * veto's own traversal logic and downstream `checkSchemaPath` consumers care
 * about. Unknown JSON Schema keywords are still accessible via the index
 * signature.
 */
export interface SerializedSchema {
  type?: string | string[];
  properties?: Record<string, SerializedSchema>;
  required?: string[];
  items?: SerializedSchema | SerializedSchema[];
  additionalProperties?: boolean | SerializedSchema;
  oneOf?: SerializedSchema[];
  anyOf?: SerializedSchema[];
  allOf?: SerializedSchema[];
  enum?: unknown[];
  const?: unknown;
  format?: string;
  description?: string;
  default?: unknown;
  [key: string]: unknown;
}

const isSerializedSchema = (value: unknown): value is SerializedSchema => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const isIndexPathSegment = (segment: string | number): boolean => {
  return Number.isInteger(segment) || /^\d+$/.test(String(segment));
};

const getSchemaArray = (value: unknown): SerializedSchema[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isSerializedSchema);
};

const getObjectChild = (
  parent: SerializedSchema,
  key: string,
): SerializedSchema | null => {
  const { properties } = parent;
  if (!properties || typeof properties !== 'object') {
    return null;
  }
  const child = (properties as Record<string, unknown>)[key];
  return isSerializedSchema(child) ? child : null;
};

const getRecordValueSchema = (
  schema: SerializedSchema,
): SerializedSchema | null => {
  const { additionalProperties } = schema;
  return isSerializedSchema(additionalProperties) ? additionalProperties : null;
};

const getArrayItemSchemas = (schema: SerializedSchema): SerializedSchema[] => {
  const { items } = schema;
  if (isSerializedSchema(items)) {
    return [items];
  }
  return getSchemaArray(items);
};

const getUnionBranches = (schema: SerializedSchema): SerializedSchema[] => {
  return [
    ...getSchemaArray(schema.oneOf),
    ...getSchemaArray(schema.anyOf),
    ...getSchemaArray(schema.allOf),
  ];
};

export const serializeSchema = (schema: VetoTypeAny): SerializedSchema => {
  try {
    // Cast to SerializedSchema: zod's toJSONSchema returns ZodStandardJSONSchemaPayload
    // (BaseSchema + standard-schema metadata). Our SerializedSchema is a structural
    // subset of JSON Schema, so the shape is compatible at runtime.
    const json = z.toJSONSchema(schema, {
      // Keep serialization resilient for transformed/preprocessed schemas used
      // throughout veto helper refinements.
      unrepresentable: 'any',
    });
    return json as unknown as SerializedSchema;
  } catch (error) {
    console.warn('[veto] serializeSchema failed:', error);
    return {};
  }
};

/**
 * Traverses a schema path to find matching types
 * @param pathType - Current schema type being traversed
 * @param path - Path segments to traverse
 * @returns Array of found schema types
 */
const traverseSchemaPath = (
  pathType: SerializedSchema,
  path: (string | number)[],
): (SerializedSchema | null)[] => {
  // Base case: end of path returns current type
  if (!path.length) {
    return [pathType];
  }

  const [current, ...remainingPath] = path;
  const currentKey = String(current);

  const unionBranches = getUnionBranches(pathType);
  if (unionBranches.length) {
    return unionBranches.flatMap((branch) => {
      return traverseSchemaPath(branch, path);
    });
  }

  const objectChild = getObjectChild(pathType, currentKey);
  if (objectChild) {
    return traverseSchemaPath(objectChild, remainingPath);
  }

  const recordValueSchema = getRecordValueSchema(pathType);
  if (recordValueSchema) {
    return traverseSchemaPath(recordValueSchema, remainingPath);
  }

  const arrayItemSchemas = getArrayItemSchemas(pathType);
  if (arrayItemSchemas.length) {
    const isIndex = isIndexPathSegment(current);

    // Tuple case: items is an array of schemas, one per position.
    if (arrayItemSchemas.length > 1 && isIndex) {
      const tupleIndex = Number(current);
      if (tupleIndex < 0 || tupleIndex >= arrayItemSchemas.length) {
        return [null];
      }
      return traverseSchemaPath(arrayItemSchemas[tupleIndex], remainingPath);
    }

    // Uniform array case: a single item schema applies to every element.
    return traverseSchemaPath(
      arrayItemSchemas[0],
      isIndex ? remainingPath : path,
    );
  }

  // Default case: invalid path for current type
  return [null];
};

export type CheckSerializedSchemaPathCheckFunction = (
  pathType: SerializedSchema | null,
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
