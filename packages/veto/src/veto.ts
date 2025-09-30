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
  VetoUnformattedError,
} from './types';
import type { vInfer } from './vInfer';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { z } from 'zod';

import { checkSerializedSchemaPath } from './serialize';

// setup global errorMap
import './errorMap';

import { issueCodes } from './issueCodes';

/**
 * Constants for error handling and validation
 */
const OBJECT_LIKE_TYPES = [
  'array',
  'discriminatedUnion',
  'object',
  'record',
] as const;

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
  // TODO: improve documentation what this does
  return checkSerializedSchemaPath(
    schema,
    (pathType) => {
      // check if type is object like
      if (isObjectLikeType(pathType?.type)) {
        return true;
      }
      // check if left or right type of
      // intersection is object like
      if (pathType?.type === 'intersection') {
        return (
          isObjectLikeType(pathType.left.type) ||
          isObjectLikeType(pathType.right.type)
        );
      }
      // otherwise type is not object like and
      // _error level can be removed
      return false;
    },
    errorPath || undefined,
  );
};

/**
 * Formats single zod error to veto error format
 * @param zodError - The Zod error to format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatVetoError = (zodError: any) => {
  let errorFormatted = zodError;

  // move params of of custom errors to top level (remove params)
  if (zodError.code === issueCodes.custom && zodError.params) {
    const { params, ...rest } = zodError;
    errorFormatted = { ...rest, ...params };
  }

  // remove _errorPath from formatted error
  delete errorFormatted._errorPath;

  return errorFormatted;
};

/**
 * Helper method that formats zod errors to desired
 * veto error format
 * @param error - Raw validation error
 * @param schema - Schema that generated the error
 * @returns Formatted veto error object
 */
const formatError = (
  error: VetoUnformattedError,
  schema: VetoSchema,
): VetoFormattedError => {
  // create zod formatted error
  // see: https://zod.dev/ERROR_HANDLING?id=formatting-errors
  const errorFormattedZod = error.format(
    // rename error path to _errorPath in issue
    ({ path: _errorPath, ...issue }) => {
      return { _errorPath, ...issue };
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorReplacer = (_key: string, value: any) => {
    // check if value has _error and return unchanged
    // value otherwise
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      !value._errors ||
      !Array.isArray(value._errors)
    ) {
      return value;
    }

    const nonErrorKeys = Object.keys(value).filter((k) => {
      return k !== '_errors';
    });
    const hasOtherValues = nonErrorKeys.length > 0;

    // remove empty _errors
    if (!value._errors.length) {
      return hasOtherValues ? { ...value, _errors: undefined } : undefined;
    }

    const errorPath = value._errors[0]._errorPath;
    const formattedErrors = value._errors.map(formatVetoError);

    // return formatted errors
    return checkIsObjectLikeError(schema as VetoTypeAny, errorPath)
      ? { ...value, _errors: formattedErrors }
      : formattedErrors;
  };

  // convert zod error format to veto error format with replacer
  return JSON.parse(JSON.stringify(errorFormattedZod, errorReplacer));
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
    const result = vSchema.safeParse({
      // add defaults to input when defined
      ...(options?.defaults || {}),
      ...input,
    });

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
      ...result,
      // error is always null on success
      errors: null,
    };
  };

  const validateAsync = async <InputType extends VetoInput>(
    input: InputType,
  ): Promise<VetoError | VetoSuccess<SchemaType>> => {
    const result = await vSchema.safeParseAsync({
      // add defaults to input when defined
      ...(options?.defaults || {}),
      ...input,
    });

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
      ...result,
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
