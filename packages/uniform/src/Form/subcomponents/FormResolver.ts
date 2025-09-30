import type {
  VetoFormattedError,
  VetoInstance,
  VetoTypeAny,
} from '@fuf-stack/veto';
import type { FieldValues } from 'react-hook-form';

import { useMemo, useRef, useState } from 'react';

import { and, veto } from '@fuf-stack/veto';

import { toValidationFormat } from '../../helpers';

/**
 * Hook that manages client validation schemas state.
 *
 * Provides a centralized way to add/remove dynamic validation schemas
 * that can be combined with base form validation.
 *
 * @returns Object with client validation state and memoized setter function
 */
export const useClientValidationManager = () => {
  // Client validation schemas state
  const [clientValidationSchemas, setClientValidationSchemas] = useState<
    Record<string, VetoTypeAny>
  >({});

  // Memoized function to set/clear client validation schema
  const setClientValidationSchema = useMemo(() => {
    return (key: string, schema: VetoTypeAny | null) => {
      // update client validation schemas
      setClientValidationSchemas((prev) => {
        // if no schema and no existing client validation schema for this key, do nothing
        if (!prev[key] && !schema) {
          return prev;
        }
        // if no schema, remove the client validation schema for this key
        if (!schema) {
          const { [key]: _removed, ...rest } = prev;
          return rest;
        }
        // if schema, add or update the client validation schema for this key
        return { ...prev, [key]: schema };
      });
    };
  }, []);

  return {
    clientValidationSchemas,
    setClientValidationSchema,
  };
};

/**
 * Hook that creates an extended validation instance combining base Veto validation with dynamic client validation.
 *
 * @param baseValidation - Optional base Veto validation schema
 * @returns Combined validation instance and client schema setter
 */
export const useExtendedValidation = (baseValidation?: VetoInstance) => {
  // Setup client validation schemas
  const { clientValidationSchemas, setClientValidationSchema } =
    useClientValidationManager();

  // Create a stable dependency array from the client validation schemas
  const clientSchemaValues = useMemo(
    () => {
      const keys = Object.keys(clientValidationSchemas).sort();
      return keys
        .map((key) => {
          return clientValidationSchemas[key];
        })
        .filter(Boolean);
    },
    // Include the object identity to react to schema instance updates with same shape
    [clientValidationSchemas],
  );

  // Memoized extended validation instance
  const extendedValidation = useMemo(
    () => {
      const hasBaseValidation = !!baseValidation;
      const hasClientSchemas = clientSchemaValues.length > 0;

      // If no base validation and no client schemas, return undefined
      if (!hasBaseValidation && !hasClientSchemas) {
        return undefined;
      }

      // If no client schemas, return base validation
      if (!hasClientSchemas) {
        return baseValidation;
      }

      // Combine client validation schemas
      const clientSchemasCombined = clientSchemaValues.reduce(
        // @ts-expect-error is ok, because initially it is null
        (combined, clientSchema) => {
          return combined ? and(combined, clientSchema) : clientSchema;
        },
        null,
      );

      // return combined validation
      if (hasBaseValidation && clientSchemasCombined) {
        return veto(and(baseValidation.schema, clientSchemasCombined));
      }

      // If we only have client schemas, return them as a veto instance
      if (clientSchemasCombined) {
        return veto(clientSchemasCombined);
      }

      // This should not happen due to the conditions above, but just in case
      return baseValidation;
    },
    // Recompute when validation schema instances change
    [baseValidation, clientSchemaValues],
  );

  return {
    extendedValidation,
    setClientValidationSchema,
  };
};

/**
 * Hook that creates a React Hook Form resolver from an extended validation instance.
 *
 * @param extendedValidation - Extended validation instance from useExtendedValidation
 * @returns Object containing resolver function, current validation errors, and optimization hash
 */
export const useFormResolver = (extendedValidation?: VetoInstance) => {
  // Use ref to store validation errors without triggering re-renders
  const validationErrors = useRef<VetoFormattedError>(undefined);

  // Memoized resolver function for React Hook Form
  const resolver = useMemo(() => {
    if (!extendedValidation) {
      return undefined;
    }

    return async (values: FieldValues) => {
      const validationValues = toValidationFormat(values) ?? {};
      const result = await extendedValidation.validateAsync(validationValues);
      validationErrors.current = result.errors ?? undefined;

      // Transform veto result to React Hook Form format
      return {
        values: result.data ?? {},
        errors: result.errors ?? {},
      };
    };
  }, [extendedValidation]);

  // Hash for memo dependency optimization in consuming components
  const validationErrorsHash = JSON.stringify(validationErrors.current);

  return {
    resolver,
    validationErrors: validationErrors.current,
    validationErrorsHash,
  };
};
