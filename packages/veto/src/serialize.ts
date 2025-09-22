import type { SzType } from 'zodex';
import type { VetoTypeAny } from './types';

import { zerialize } from 'zodex';

// re-export zodex types
export type * from 'zodex';

// Type predicates for checking schema types
const isArrayType = (
  type: SzType,
): type is SzType & {
  type: 'array';
  element: SzType;
} => {
  return type.type === 'array' && 'element' in type;
};

const isDiscriminatedUnionType = (
  type: SzType,
): type is SzType & {
  type: 'discriminatedUnion';
  options: SzType[];
} => {
  return type.type === 'discriminatedUnion' && 'options' in type;
};

const isIntersectionType = (
  type: SzType,
): type is SzType & {
  type: 'intersection';
  left: SzType;
  right: SzType;
} => {
  return type.type === 'intersection' && 'left' in type && 'right' in type;
};

const isObjectType = (
  type: SzType,
): type is SzType & {
  type: 'object';
  properties: Record<string, SzType>;
} => {
  return type.type === 'object' && 'properties' in type;
};

const isRecordType = (
  type: SzType,
): type is SzType & {
  type: 'record';
  value: SzType;
} => {
  return type.type === 'record' && 'value' in type;
};

export const serializeSchema = (schema: VetoTypeAny): SzType => {
  return zerialize(schema) as SzType;
};

/**
 * Traverses a schema path to find matching types
 * @param pathType - Current schema type being traversed
 * @param path - Path segments to traverse
 * @returns Array of found schema types
 */
const traverseSchemaPath = (
  pathType: SzType,
  path: (string | number)[],
): (SzType | null)[] => {
  // Base case: end of path returns current type
  if (!path.length) {
    return [pathType];
  }

  const [current, ...remainingPath] = path;

  if (isArrayType(pathType)) {
    const isIndex = Number.isInteger(current) || /^\d+$/.test(String(current));
    return traverseSchemaPath(pathType.element, isIndex ? remainingPath : path);
  }

  if (isDiscriminatedUnionType(pathType)) {
    return pathType.options.flatMap((option: SzType) => {
      return traverseSchemaPath(option, path);
    });
  }

  if (isIntersectionType(pathType)) {
    return [
      ...traverseSchemaPath(pathType.left, path),
      ...traverseSchemaPath(pathType.right, path),
    ];
  }

  if (isObjectType(pathType)) {
    if (pathType.properties[current]) {
      return traverseSchemaPath(pathType.properties[current], remainingPath);
    }
    // not found
    return [null];
  }

  if (isRecordType(pathType)) {
    return traverseSchemaPath(pathType.value, remainingPath);
  }

  // Default case: invalid path for current type
  return [null];
};

export type CheckSerializedSchemaPathCheckFunction = (
  pathType: SzType | null,
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
