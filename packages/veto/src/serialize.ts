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
 * Returns true when a path segment represents an array index.
 */
const isIndexPathSegment = (segment: string | number): boolean => {
  return Number.isInteger(segment) || /^\d+$/.test(String(segment));
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

export type CheckSerializedSchemaPathCheckFunction = (
  pathType: SerializedSchemaPathType | null,
) => boolean;

/**
 * Matched schema node plus optional/nullable flags recovered from Zod wrappers.
 */
interface ZodPathMatch {
  schema: VetoTypeAny;
  isNullable: boolean;
  isOptional: boolean;
}

/**
 * Metadata carried while traversing Zod schema internals.
 */
interface ZodTraversalMeta {
  isNullable: boolean;
  isOptional: boolean;
}

/**
 * Reads Zod v3/v4 internal definition objects (`def`/`_def`) in a safe way.
 */
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

/**
 * Unwraps common wrapper nodes (optional/nullable/nonoptional/pipe) and returns
 * the effective inner schema with its optional/nullable flags.
 */
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

/**
 * Returns object shape map from a Zod object schema definition.
 */
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

/**
 * Returns array element schema from a Zod array definition.
 */
const getArrayElementSchema = (schema: VetoTypeAny): VetoTypeAny | null => {
  const def = getSchemaDef(schema);
  if (def?.type !== 'array') {
    return null;
  }
  const { element } = def;
  return element ? (element as VetoTypeAny) : null;
};

/**
 * Returns value schema from a Zod record definition.
 */
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

/**
 * Collects branch schemas for union/intersection-like Zod nodes.
 */
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

/**
 * Traverses a path through Zod schema internals and returns all matching nodes.
 */
const traverseZodSchemaPath = (
  schema: VetoTypeAny,
  path: (string | number)[],
): ZodPathMatch[] => {
  const unwrapped = unwrapSchemaFlags(schema);
  const currentSchema = unwrapped.schema;
  const currentMeta: ZodTraversalMeta = {
    // Do not auto-propagate parent requiredness to descendants.
    // Requiredness checks should reflect the node at the current path.
    isNullable: unwrapped.isNullable,
    isOptional: unwrapped.isOptional,
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
      return traverseZodSchemaPath(branch, path);
    });
  }

  const objectShape = getObjectShape(currentSchema);
  const objectChildSchema = objectShape?.[currentKey];
  if (objectChildSchema) {
    return traverseZodSchemaPath(objectChildSchema, remainingPath);
  }

  const recordValueSchema = getRecordValueSchemaFromZod(currentSchema);
  if (recordValueSchema) {
    return traverseZodSchemaPath(recordValueSchema, remainingPath);
  }

  const arrayElementSchema = getArrayElementSchema(currentSchema);
  if (arrayElementSchema) {
    const isIndex = isIndexPathSegment(current);
    return traverseZodSchemaPath(
      arrayElementSchema,
      isIndex ? remainingPath : path,
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
