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

/**
 * Schema shape provided to `checkSerializedSchemaPath` callbacks.
 *
 * It extends plain JSON Schema with traversal-derived compatibility metadata
 * used by consumers like uniform's `checkFieldIsRequired`.
 */
export interface SerializedSchemaPathType extends SerializedSchema {
  /** This path may be absent from an object (`required` does not include it). */
  isOptional?: boolean;
  /** This path may be null (direct `null` type or union including `null`). */
  isNullable?: boolean;
}

/**
 * Narrows unknown values to object-like JSON Schema nodes.
 */
const isSerializedSchema = (value: unknown): value is SerializedSchema => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Returns true when a path segment represents an array index.
 */
const isIndexPathSegment = (segment: string | number): boolean => {
  return Number.isInteger(segment) || /^\d+$/.test(String(segment));
};

/**
 * Normalizes unknown values into an array of schema objects.
 */
const getSchemaArray = (value: unknown): SerializedSchema[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isSerializedSchema);
};

/**
 * Detects whether the schema (or one of its union branches) allows `null`.
 */
const hasNullType = (schema: SerializedSchema): boolean => {
  if (schema.type === 'null') {
    return true;
  }
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    return true;
  }
  const unionBranches = [
    ...getSchemaArray(schema.oneOf),
    ...getSchemaArray(schema.anyOf),
    ...getSchemaArray(schema.allOf),
  ];
  return unionBranches.some(hasNullType);
};

/**
 * Traversal flags propagated while walking nested schema paths.
 */
interface TraversalMeta {
  isOptional: boolean;
  isNullable: boolean;
}

/**
 * Default traversal state for root-level checks.
 */
const ROOT_TRAVERSAL_META: TraversalMeta = {
  isOptional: false,
  isNullable: false,
};

/**
 * Combines schema-local metadata with inherited traversal flags.
 */
const mergeTraversalMeta = (
  schema: SerializedSchema,
  meta: TraversalMeta,
): SerializedSchemaPathType => {
  return {
    ...schema,
    isOptional: Boolean((schema.isOptional ?? false) || meta.isOptional),
    isNullable: Boolean(
      (schema.isNullable ?? false) || meta.isNullable || hasNullType(schema),
    ),
  };
};

/**
 * Resolves an object property schema and augments it with requiredness metadata.
 */
const getObjectChild = (
  parent: SerializedSchema,
  key: string,
  inheritedMeta: TraversalMeta,
): SerializedSchemaPathType | null => {
  const { properties } = parent;
  if (!properties || typeof properties !== 'object') {
    return null;
  }
  const child = (properties as Record<string, unknown>)[key];
  if (!isSerializedSchema(child)) {
    return null;
  }

  const isRequired =
    Array.isArray(parent.required) && parent.required.includes(key);
  return mergeTraversalMeta(child, {
    isOptional: inheritedMeta.isOptional || !isRequired,
    isNullable: inheritedMeta.isNullable,
  });
};

/**
 * Returns the value schema for JSON Schema records (`additionalProperties`).
 */
const getRecordValueSchema = (
  schema: SerializedSchema,
): SerializedSchema | null => {
  const { additionalProperties } = schema;
  return isSerializedSchema(additionalProperties) ? additionalProperties : null;
};

/**
 * Returns array item schemas for both homogeneous and tuple-style arrays.
 */
const getArrayItemSchemas = (schema: SerializedSchema): SerializedSchema[] => {
  const { items } = schema;
  if (isSerializedSchema(items)) {
    return [items];
  }
  return getSchemaArray(items);
};

/**
 * Collects all union/intersection branch schemas used during traversal.
 */
const getUnionBranches = (schema: SerializedSchema): SerializedSchema[] => {
  return [
    ...getSchemaArray(schema.oneOf),
    ...getSchemaArray(schema.anyOf),
    ...getSchemaArray(schema.allOf),
  ];
};

/**
 * Serializes a Zod schema to JSON Schema, with resilient handling for
 * transformed/preprocessed nodes used in veto helpers.
 */
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
const _traverseSchemaPath = (
  pathType: SerializedSchema,
  path: (string | number)[],
  inheritedMeta: TraversalMeta = ROOT_TRAVERSAL_META,
): (SerializedSchemaPathType | null)[] => {
  const pathSchema = mergeTraversalMeta(pathType, inheritedMeta);

  // Base case: end of path returns current type
  if (!path.length) {
    return [pathSchema];
  }

  const [current, ...remainingPath] = path;
  const currentKey = String(current);

  const unionBranches = getUnionBranches(pathSchema);
  if (unionBranches.length) {
    return unionBranches.flatMap((branch) => {
      return _traverseSchemaPath(branch, path, {
        isOptional: Boolean(pathSchema.isOptional),
        isNullable: Boolean(pathSchema.isNullable),
      });
    });
  }

  const objectChild = getObjectChild(pathSchema, currentKey, {
    isOptional: Boolean(pathSchema.isOptional),
    isNullable: Boolean(pathSchema.isNullable),
  });
  if (objectChild) {
    return _traverseSchemaPath(objectChild, remainingPath, {
      isOptional: Boolean(objectChild.isOptional),
      isNullable: Boolean(objectChild.isNullable),
    });
  }

  const recordValueSchema = getRecordValueSchema(pathSchema);
  if (recordValueSchema) {
    return _traverseSchemaPath(recordValueSchema, remainingPath, {
      isOptional: Boolean(pathSchema.isOptional),
      isNullable: Boolean(pathSchema.isNullable),
    });
  }

  const arrayItemSchemas = getArrayItemSchemas(pathSchema);
  if (arrayItemSchemas.length) {
    const isIndex = isIndexPathSegment(current);

    // Tuple case: items is an array of schemas, one per position.
    if (arrayItemSchemas.length > 1 && isIndex) {
      const tupleIndex = Number(current);
      if (tupleIndex < 0 || tupleIndex >= arrayItemSchemas.length) {
        return [null];
      }
      return _traverseSchemaPath(arrayItemSchemas[tupleIndex], remainingPath, {
        isOptional: Boolean(pathSchema.isOptional),
        isNullable: Boolean(pathSchema.isNullable),
      });
    }

    // Uniform array case: a single item schema applies to every element.
    return _traverseSchemaPath(
      arrayItemSchemas[0],
      isIndex ? remainingPath : path,
      {
        isOptional: Boolean(pathSchema.isOptional),
        isNullable: Boolean(pathSchema.isNullable),
      },
    );
  }

  // Default case: invalid path for current type
  return [null];
};

export type CheckSerializedSchemaPathCheckFunction = (
  pathType: SerializedSchemaPathType | null,
) => boolean;

interface ZodPathMatch {
  schema: VetoTypeAny;
  isNullable: boolean;
  isOptional: boolean;
}

interface ZodTraversalMeta {
  isNullable: boolean;
  isOptional: boolean;
}

const ROOT_ZOD_TRAVERSAL_META: ZodTraversalMeta = {
  isNullable: false,
  isOptional: false,
};

const getSchemaDef = (schema: unknown): Record<string, unknown> | null => {
  if (!schema || typeof schema !== 'object') {
    return null;
  }
  const maybeSchema = schema as {
    _def?: Record<string, unknown>;
    def?: Record<string, unknown>;
  };
  return maybeSchema.def ?? maybeSchema._def ?? null;
};

const unwrapSchemaFlags = (
  schema: VetoTypeAny,
): {
  schema: VetoTypeAny;
  isNullable: boolean;
  isOptional: boolean;
} => {
  let current = schema;
  let isOptional = false;
  let isNullable = false;

  let currentDef = getSchemaDef(current);
  while (currentDef) {
    const currentType = currentDef.type;
    if (currentType === 'optional') {
      isOptional = true;
      current = currentDef.innerType as VetoTypeAny;
    } else if (currentType === 'nullable') {
      isNullable = true;
      current = currentDef.innerType as VetoTypeAny;
    } else if (currentType === 'nonoptional') {
      isOptional = false;
      current = currentDef.innerType as VetoTypeAny;
    } else if (currentType === 'pipe') {
      current = (currentDef.out ?? currentDef.in) as VetoTypeAny;
    } else {
      break;
    }
    currentDef = getSchemaDef(current);
  }

  return {
    schema: current,
    isOptional,
    isNullable,
  };
};

const getObjectShape = (
  schema: VetoTypeAny,
): Record<string, VetoTypeAny> | null => {
  const def = getSchemaDef(schema);
  if (def?.type !== 'object') {
    return null;
  }
  const { shape } = def;
  if (!shape || typeof shape !== 'object') {
    return null;
  }
  return shape as Record<string, VetoTypeAny>;
};

const getArrayElementSchema = (schema: VetoTypeAny): VetoTypeAny | null => {
  const def = getSchemaDef(schema);
  if (def?.type !== 'array') {
    return null;
  }
  const { element } = def;
  return element ? (element as VetoTypeAny) : null;
};

const getRecordValueSchemaFromZod = (
  schema: VetoTypeAny,
): VetoTypeAny | null => {
  const def = getSchemaDef(schema);
  if (def?.type !== 'record') {
    return null;
  }
  const valueSchema = def.valueType ?? def.value;
  return valueSchema ? (valueSchema as VetoTypeAny) : null;
};

const getUnionBranchesFromZod = (schema: VetoTypeAny): VetoTypeAny[] => {
  const def = getSchemaDef(schema);
  if (!def) {
    return [];
  }
  if (def.type === 'intersection') {
    const branches = [def.left, def.right].filter(Boolean);
    return branches as VetoTypeAny[];
  }
  if (def.type === 'union' && Array.isArray(def.options)) {
    return def.options as VetoTypeAny[];
  }
  return [];
};

const traverseZodSchemaPath = (
  schema: VetoTypeAny,
  path: (string | number)[],
  inheritedMeta: ZodTraversalMeta = ROOT_ZOD_TRAVERSAL_META,
): ZodPathMatch[] => {
  const unwrapped = unwrapSchemaFlags(schema);
  const currentSchema = unwrapped.schema;
  const currentMeta: ZodTraversalMeta = {
    isNullable: inheritedMeta.isNullable || unwrapped.isNullable,
    isOptional:
      inheritedMeta.isOptional ||
      inheritedMeta.isNullable ||
      unwrapped.isOptional,
  };

  if (!path.length) {
    return [
      {
        schema: currentSchema,
        isNullable: currentMeta.isNullable,
        isOptional: currentMeta.isOptional,
      },
    ];
  }

  const [current, ...remainingPath] = path;
  const currentKey = String(current);

  const unionBranches = getUnionBranchesFromZod(currentSchema);
  if (unionBranches.length) {
    return unionBranches.flatMap((branch) => {
      return traverseZodSchemaPath(branch, path, currentMeta);
    });
  }

  const objectShape = getObjectShape(currentSchema);
  const objectChildSchema = objectShape?.[currentKey];
  if (objectChildSchema) {
    return traverseZodSchemaPath(objectChildSchema, remainingPath, currentMeta);
  }

  const recordValueSchema = getRecordValueSchemaFromZod(currentSchema);
  if (recordValueSchema) {
    return traverseZodSchemaPath(recordValueSchema, remainingPath, currentMeta);
  }

  const arrayElementSchema = getArrayElementSchema(currentSchema);
  if (arrayElementSchema) {
    const isIndex = isIndexPathSegment(current);
    return traverseZodSchemaPath(
      arrayElementSchema,
      isIndex ? remainingPath : path,
      currentMeta,
    );
  }

  return [];
};

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
  const matches = traverseZodSchemaPath(schema, path ?? []);
  const validTypes = matches.map((match): SerializedSchemaPathType => {
    return {
      ...serializeSchema(match.schema),
      isNullable: match.isNullable,
      isOptional: match.isOptional,
    };
  });

  // Check if all valid types satisfy the check function if we have
  // valid types, otherwise return false
  return validTypes.length ? validTypes.every(checkFn) : false;
};
