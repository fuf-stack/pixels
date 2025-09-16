/* eslint-disable @typescript-eslint/no-explicit-any */

import type { VetoInstance } from '@fuf-stack/veto';
import type { FieldError, FieldValues, Path } from 'react-hook-form';

import { useContext } from 'react';
import { useFormContext as useHookFormContext } from 'react-hook-form';

import { slugify } from '@fuf-stack/pixel-utils';

import { UniformContext } from '../../Form/subcomponents/FormContext';
import { toValidationFormat } from '../../helpers';

/** Schema check whether a field is required or optional */
export const checkFieldIsRequired = (
  validation: VetoInstance,
  path: string[],
): boolean => {
  const checkRequired = (schema: any) => {
    // arrays with minLength are required
    if (schema.type === 'array' && schema?.minLength) {
      return true;
    }
    // all other fields are required if they are
    // not optional and not nullable
    return !schema.isOptional && !schema.isNullable;
  };

  return validation.checkSchemaPath(checkRequired, path);
};

/**
 * Custom hook that extends react-hook-form's useFormContext to add validation and state management.
 */
export const useFormContext = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>() => {
  const {
    formState,
    // some methods that will be enhanced below
    getFieldState: getFieldStateOrig,
    getValues: getValuesOrig,
    watch: watchOrig,
    subscribe: subscribeOrig,
    // the rest of the methods pass through unchanged
    ...otherMethods
  } = useHookFormContext<TFieldValues, TContext, TTransformedValues>();

  const uniformContext = useContext(UniformContext);

  /**
   * Updated getFieldState method which returns:
   * - Whether the field is required by checking the validation schema
   * - Existing field state information (errors, etc.)
   */
  const getFieldState = (name: Path<TFieldValues>, testId?: string) => {
    const fieldPath =
      typeof name === 'string' ? name.replace(/\[\d+\]/g, '').split('.') : name;

    // Check if the field is required using the validation schema
    const required = uniformContext?.validation.instance
      ? checkFieldIsRequired(uniformContext.validation.instance, fieldPath)
      : false;

    // Get the original field state (errors, etc.) from react-hook-form
    const { error, ...rest } = getFieldStateOrig(name, formState);

    return {
      ...rest,
      error: error as FieldError[] | undefined, // Ensure correct type for error
      required,
      testId: slugify(testId || name, { replaceDots: true }),
    };
  };

  /**
   * Wrap form value accessor methods to automatically convert from internal storage format
   * to component-friendly format:
   *
   * - Convert nullish string markers: "__NULL__" → null, "__FALSE__" → false, "__ZERO__" → 0
   * - Filter out empty/null values: fields with converted null/empty values are removed entirely
   *
   * This ensures components receive clean, predictable data without needing to handle
   * the internal nullish string conversion system manually.
   */
  const getValues = ((...args: any[]) => {
    const result = (getValuesOrig as any)(...args);
    return toValidationFormat(result);
  }) as typeof getValuesOrig;

  const watch = ((...args: any[]) => {
    const result = (watchOrig as any)(...args);
    return toValidationFormat(result);
  }) as typeof watchOrig;

  const subscribe = ((...args: any[]) => {
    // For subscribe, we need to wrap the callback to convert the values property
    const [options] = args;
    if (options?.callback) {
      const originalCallback = options.callback;
      const wrappedOptions = {
        ...options,
        callback: (subscribeFormState: any) => {
          // Convert the values property if it exists
          const convertedFormState = {
            ...subscribeFormState,
            ...(subscribeFormState.values && {
              values: toValidationFormat(subscribeFormState.values),
            }),
          };
          return originalCallback(convertedFormState);
        },
      };
      return subscribeOrig(wrappedOptions);
    }
    return (subscribeOrig as any)(...args);
  }) as typeof subscribeOrig;

  return {
    ...otherMethods,
    ...uniformContext,
    formState,
    getFieldState,
    getValues,
    subscribe,
    watch,
  };
};
