import type { CheckSerializedSchemaPathCheckFunction } from './serialize';
import type {
  VetoError,
  VetoFormattedError,
  VetoInput,
  VetoOptions,
  VetoRawShape,
  VetoSchema,
  VetoSuccess,
  VetoTypeAny,
} from './types';
import type { vInfer } from './vInfer';

import { z } from 'zod';

import { checkSerializedSchemaPath } from './serialize';

// setup global errorMap
import './errorMap';

import { issueCodes } from './issueCodes';

/**
 * Constants for error handling and validation
 */
const OBJECT_LIKE_TYPES = ['array', 'object'] as const;

type ObjectLikeType = (typeof OBJECT_LIKE_TYPES)[number];

/** Type guard to check if a schema type is object-like */
const isObjectLikeType = (type?: string): type is ObjectLikeType => {
  return OBJECT_LIKE_TYPES.includes(type as ObjectLikeType);
};

/**
 * Checks if a given schema path corresponds to an object-like error structure
 * @param schema - The schema to check
 * @param errorPath - Optional path to check within the schema
 */
const checkIsObjectLikeError = (
  schema: VetoTypeAny,
  errorPath?: (string | number)[],
) => {
  try {
    return checkSerializedSchemaPath(
      schema,
      (pathType) => {
        // check if type is object like
        if (isObjectLikeType(pathType?.type)) {
          return true;
        }
        // check if anyOf (union) contains object-like types
        if (pathType?.anyOf && Array.isArray(pathType.anyOf)) {
          return pathType.anyOf.some((option: { type?: string }) => {
            return isObjectLikeType(option?.type);
          });
        }
        // check if oneOf (discriminatedUnion in Zod v4) contains object-like types
        if (pathType?.oneOf && Array.isArray(pathType.oneOf)) {
          return pathType.oneOf.some((option: { type?: string }) => {
            return isObjectLikeType(option?.type);
          });
        }
        // check if allOf (intersection) contains object-like types
        if (pathType?.allOf && Array.isArray(pathType.allOf)) {
          return pathType.allOf.some((s: { type?: string }) => {
            return isObjectLikeType(s?.type);
          });
        }
        // otherwise type is not object like and
        // _error level can be removed
        return false;
      },
      errorPath || undefined,
    );
  } catch {
    // If schema serialization fails, default to keeping _errors wrapper
    // for safety (object-like behavior)
    return true;
  }
};

/**
 * Get the type name for a value (similar to Zod v3's received property)
 * @param value - Value to get type for
 * @returns Type name string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReceivedType = (value: any): string => {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (value instanceof Date) {
    return 'date';
  }
  if (value instanceof Map) {
    return 'map';
  }
  if (value instanceof Set) {
    return 'set';
  }
  if (typeof value === 'object') {
    return 'object';
  }
  return typeof value; // 'string', 'number', 'boolean', 'bigint', 'symbol', 'function'
};

/**
 * Formats single zod error to veto error format
 * @param zodIssue - The Zod issue to format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatVetoError = (zodIssue: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { path, input, ...errorFormatted } = zodIssue;

  // For invalid_type errors, add the received type (Zod v4 compatibility)
  // This maintains backwards compatibility with Zod v3's received property
  if (zodIssue.code === issueCodes.invalid_type && 'input' in zodIssue) {
    errorFormatted.received = getReceivedType(input);
  }

  // move params of custom errors to top level (remove params)
  if (zodIssue.code === issueCodes.custom && zodIssue.params) {
    const { params, ...rest } = errorFormatted;
    return { ...rest, ...params };
  }

  return errorFormatted;
};

/**
 * Helper to set a value at a nested path in an object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setNestedValue = (obj: any, path: (string | number)[], value: any) => {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = { _errors: [] };
    } else if (!current[key]._errors) {
      // Ensure _errors array exists
      current[key]._errors = [];
    }
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  if (!current[lastKey]) {
    current[lastKey] = { _errors: [] };
  } else if (!current[lastKey]._errors) {
    current[lastKey]._errors = [];
  }
  current[lastKey]._errors.push(value);
};

/**
 * Recursively transforms the error structure, removing _errors wrapper
 * for non-object-like types
 * @param value - Current error object to transform
 * @param schema - Schema to check against
 * @param currentPath - Current path in the error structure
 */
const transformErrorValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  schema: VetoSchema,
  currentPath: (string | number)[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  // Return primitives unchanged
  if (!value || typeof value !== 'object') {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value;
  }

  // Check if this is an error node (has _errors)
  const hasErrors = '_errors' in value && Array.isArray(value._errors);
  const nonErrorKeys = Object.keys(value).filter((k) => {
    return k !== '_errors';
  });
  const hasOtherValues = nonErrorKeys.length > 0;

  // First, recursively transform children
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedChildren: Record<string, any> = {};
  for (const key of nonErrorKeys) {
    transformedChildren[key] = transformErrorValue(value[key], schema, [
      ...currentPath,
      key,
    ]);
  }

  // If no _errors, just return transformed children
  if (!hasErrors) {
    return Object.keys(transformedChildren).length > 0
      ? transformedChildren
      : value;
  }

  // Handle _errors
  const errors = value._errors;

  // Remove empty _errors
  if (!errors.length) {
    return hasOtherValues ? transformedChildren : undefined;
  }

  // Check if current path corresponds to object-like type
  const isObjectLike = checkIsObjectLikeError(
    schema as VetoTypeAny,
    currentPath.length > 0 ? currentPath : undefined,
  );

  // If object-like, keep _errors wrapper; otherwise return just the array
  if (isObjectLike) {
    return hasOtherValues
      ? { ...transformedChildren, _errors: errors }
      : { _errors: errors };
  }

  // For non-object-like types, return just the errors array
  // But if there are other values (nested errors), we need to merge
  if (hasOtherValues) {
    return { ...transformedChildren, _errors: errors };
  }

  return errors;
};

/**
 * Helper method that formats zod errors to desired
 * veto error format
 * @param error - Raw validation error
 * @param schema - Schema that generated the error
 * @returns Formatted veto error object
 */
const formatError = (
  error: z.ZodError,
  schema: VetoSchema,
): VetoFormattedError => {
  // Build the error structure from issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = { _errors: [] };

  for (const issue of error.issues) {
    const formattedError = formatVetoError(issue);
    // In Zod v4, path is PropertyKey[] - filter out symbols and cast
    const path = issue.path.filter((p): p is string | number => {
      return typeof p === 'string' || typeof p === 'number';
    });

    if (path.length === 0) {
      // Root level error
      result._errors.push(formattedError);
    } else {
      // Nested error - build path structure
      setNestedValue(result, path, formattedError);
    }
  }

  // Transform the error structure with path awareness
  return transformErrorValue(result, schema) as VetoFormattedError;
};

/**
 * Creates a Veto validator instance
 * @param schema - Schema to validate against
 * @param options - Validation options
 * @returns Validator instance with validation methods
 */
export const veto = <T extends VetoSchema>(
  schema: T,
  options?: VetoOptions,
) => {
  const vSchema = schema.safeParse
    ? (schema as VetoTypeAny)
    : z
        .object(schema as VetoRawShape)
        //  If there are any unknown keys in the input always throw an error.
        // see: https://github.com/colinhacks/zod#strict
        .strict();

  type SchemaType = vInfer<T>;

  const validate = <InputType extends VetoInput>(
    input: InputType,
  ): VetoError | VetoSuccess<SchemaType> => {
    const result = vSchema.safeParse(
      {
        // add defaults to input when defined
        ...(options?.defaults || {}),
        ...input,
      },
      // Enable reportInput so we can compute 'received' type for invalid_type errors
      // The actual input value is stripped from the formatted output for security
      { reportInput: true },
    );

    // error result
    if (!result.success) {
      return {
        success: result.success,
        // data is alway null on error
        data: null,
        // format error to v format
        errors: formatError(result.error, vSchema),
      };
    }
    // success result
    return {
      success: true,
      data: result.data as SchemaType,
      // error is always null on success
      errors: null,
    };
  };

  const validateAsync = async <InputType extends VetoInput>(
    input: InputType,
  ): Promise<VetoError | VetoSuccess<SchemaType>> => {
    const result = await vSchema.safeParseAsync(
      {
        // add defaults to input when defined
        ...(options?.defaults || {}),
        ...input,
      },
      // Enable reportInput so we can compute 'received' type for invalid_type errors
      // The actual input value is stripped from the formatted output for security
      { reportInput: true },
    );

    // error result
    if (!result.success) {
      return {
        success: result.success,
        // data is alway null on error
        data: null,
        // format error to v format
        errors: formatError(result.error, vSchema),
      };
    }
    // success result
    return {
      success: true,
      data: result.data as SchemaType,
      // error is always null on success
      errors: null,
    };
  };

  return {
    schema: vSchema as SchemaType,
    checkSchemaPath: (
      checkFn: CheckSerializedSchemaPathCheckFunction,
      path?: string[],
    ) => {
      return checkSerializedSchemaPath(vSchema, checkFn, path);
    },
    validate,
    validateAsync,
  };
};

/** A veto instance */
export type VetoInstance = ReturnType<typeof veto>;

export default veto;
