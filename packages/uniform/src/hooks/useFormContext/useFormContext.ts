/* eslint-disable @typescript-eslint/no-explicit-any */

import type { VetoFormattedError, VetoInstance } from '@fuf-stack/veto';
import type { FieldError, FieldValues, Path } from 'react-hook-form';

import { useContext } from 'react';
import { useFormContext as useHookFormContext } from 'react-hook-form';

import { UniformContext } from '../../Form/subcomponents/FormContext';
import { flatArrayKey, nameToTestId, toValidationFormat } from '../../helpers';

/** Schema check whether a field is required or optional */
export const checkFieldIsRequired = (
  validation: VetoInstance,
  path: string[],
): boolean => {
  // Handle flat array paths: strip the flatArrayKey to check the array element schema
  // e.g., ['arrayField', '0', '__FLAT__'] -> check schema at ['arrayField', '0']
  const checkPath =
    path[path.length - 1] === flatArrayKey ? path.slice(0, -1) : path;

  const checkRequired = (schema: any) => {
    // arrays ...
    if (schema.type === 'array') {
      // ... if array is optional or nullable it is not required
      if (schema.isOptional || schema.isNullable) {
        return false;
      }
      // ... otherwise arrays are required (display logic wise -> no asterisk in the label)
      return true;
    }

    // all other fields are required if they are
    // not optional and not nullable
    return !schema.isOptional && !schema.isNullable;
  };

  return validation.checkSchemaPath(checkRequired, checkPath);
};

/**
 * Resolve validation errors for a given field path.
 *
 * Traverses a nested `VetoFormattedError` structure using a dotted path
 * (for example: "user.address.0.street") and returns the matching
 * `FieldError[]` if present. If no error exists at the path, returns
 * `undefined`.
 *
 * @param errors - The formatted validation errors from Uniform's context
 * @param name - The dotted field path to resolve
 * @returns An array of `FieldError` entries for the field, or `undefined`
 */
const getValidationErrorsByName = (
  errors: VetoFormattedError,
  name: string,
) => {
  // Traverse nested error structure; ignore flat array wrapper key
  const keys = name.split('.').filter((k) => {
    return k !== flatArrayKey;
  });
  let current: unknown = errors as unknown;
  keys.forEach((key) => {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      current = undefined;
    }
  });
  return current as FieldError[] | undefined;
};

/**
 * Custom hook that extends react-hook-form's useFormContext to add validation and state management.
 *
 * Key features:
 * - Enhanced `getFieldState` that includes validation schema-based "required" status and testId generation
 * - Automatic conversion of form values via `getValues`, `watch`, and `subscribe`:
 *   - Unwraps flat array wrappers (`{ __FLAT__: value }` → `value`)
 *   - Converts nullish string markers (`__NULL__` → `null`, `__FALSE__` → `false`, `__ZERO__` → `0`)
 *   - Filters out empty/null values
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
   * - A testId generated from the field name (with flat array keys removed and slugified)
   *
   * @param name - The field path (string or array)
   * @param testId - Optional explicit testId. If provided, will be slugified. If not provided, generated from name.
   */
  const getFieldState = (name: Path<TFieldValues>, testId?: string) => {
    const fieldPath =
      typeof name === 'string' ? name.replace(/\[\d+\]/g, '').split('.') : name;

    // Use base validation instance for checking "required" status
    // Client validation often uses .nullish() which would incorrectly mark fields as optional
    const validationInstance =
      uniformContext?.validation.baseInstance ??
      uniformContext?.validation.instance;

    // Check if the field is required using the validation schema
    const required = validationInstance
      ? checkFieldIsRequired(validationInstance, fieldPath)
      : false;

    const error = getValidationErrorsByName(
      uniformContext?.validation.errors ?? {},
      name,
    ) as unknown as FieldError[] | undefined;

    // Get everything but the error from the original field state
    const fieldState = getFieldStateOrig(name, formState);

    return {
      ...fieldState,
      error,
      invalid: !!error,
      required,
      testId: nameToTestId(testId ?? name),
    };
  };

  /**
   * Wrap form value accessor methods to automatically convert from internal storage format
   * to component-friendly format:
   *
   * - Unwrap flat array wrappers: `{ __FLAT__: value }` → `value`
   * - Convert nullish string markers: `__NULL__` → `null`, `__FALSE__` → `false`, `__ZERO__` → `0`
   * - Filter out empty/null values: fields with converted null/empty values are removed entirely
   *
   * This ensures components receive clean, predictable data without needing to handle
   * the internal nullish string conversion system or flat array wrapping manually.
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return originalCallback(convertedFormState);
        },
      };
      return subscribeOrig(wrappedOptions);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
