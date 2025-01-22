import type { VetoInstance } from '@fuf-stack/veto';
import type { FieldError } from 'react-hook-form';

import { useContext } from 'react';
import { useFormContext as useHookFormContext } from 'react-hook-form';

import { slugify } from '@fuf-stack/pixel-utils';

import { UniformContext } from '../../Form/subcomponents/FormContext';

/** Schema check whether a field is required or optional */
export const checkFieldIsRequired = (
  validation: VetoInstance,
  path: string[],
): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export const useFormContext = () => {
  const {
    formState,
    // https://react-hook-form.com/docs/useform/getfieldstate
    // for getFieldState a subscription to formState properties is needed!
    getFieldState: getFieldStateOrig,
    ...otherMethods
  } = useHookFormContext();

  const uniformContext = useContext(UniformContext);

  /**
   * Updated getFieldState method which returns:
   * - Whether the field is required by checking the validation schema
   * - Existing field state information (errors, etc.)
   */
  const getFieldState = (name: string, testId?: string) => {
    const fieldPath =
      typeof name === 'string' ? name.replace(/\[\d+\]/g, '').split('.') : name;

    // Check if the field is required using the validation schema
    const required = uniformContext?.validation
      ? checkFieldIsRequired(uniformContext.validation, fieldPath)
      : false;

    // Get the original field state (errors, etc.) from react-hook-form
    const { error, ...rest } = getFieldStateOrig(name, formState);

    return {
      ...rest,
      error: error as FieldError[] | undefined, // Ensure correct type for error
      required,
      testId: slugify(testId || name),
    };
  };

  return {
    ...otherMethods,
    ...uniformContext,
    getFieldState,
    formState,
  };
};
