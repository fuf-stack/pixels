import type { CheckSerializedSchemaPathCheckFunction } from './serialize';
import type {
  VetoError,
  VetoInput,
  VetoOptions,
  VetoRawShape,
  VetoSchema,
  VetoSuccess,
  VetoTypeAny,
} from './types';
import type { vInfer } from './vInfer';

import { z } from 'zod';

// setup global errorMap (side-effect import)
import './errorMap';

import { formatError } from './formatError';
import { checkSerializedSchemaPath } from './serialize';

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
        // If there are any unknown keys in the input always throw an error.
        .strictObject(schema as VetoRawShape);

  type SchemaType = vInfer<T>;

  const validate = <InputType extends VetoInput>(
    input: InputType,
  ): VetoError | VetoSuccess<SchemaType> => {
    const result = vSchema.safeParse({
      // add defaults to input when defined
      ...(options?.defaults ?? {}),
      ...input,
    });

    // error result
    if (!result.success) {
      return {
        success: false,
        // data is alway null on error
        data: null,
        // format error to v format
        errors: formatError(result.error, vSchema),
      };
    }
    // success result
    return {
      ...result,
      data: result.data as SchemaType,
      // error is always null on success
      errors: null,
    };
  };

  const validateAsync = async <InputType extends VetoInput>(
    input: InputType,
  ): Promise<VetoError | VetoSuccess<SchemaType>> => {
    const result = await vSchema.safeParseAsync({
      // add defaults to input when defined
      ...(options?.defaults ?? {}),
      ...input,
    });

    // error result
    if (!result.success) {
      return {
        success: false,
        // data is alway null on error
        data: null,
        // format error to v format
        errors: formatError(result.error, vSchema),
      };
    }
    // success result
    return {
      ...result,
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
