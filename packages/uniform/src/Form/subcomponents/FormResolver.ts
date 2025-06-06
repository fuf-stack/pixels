/* eslint-disable import/prefer-default-export */

import type {
  VetoFormattedError,
  VetoInstance,
  VetoTypeAny,
} from '@fuf-stack/veto';
import type { FieldValues } from 'react-hook-form';

import { useMemo, useRef, useState } from 'react';

import { and, serializeSchema, veto } from '@fuf-stack/veto';

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
  const setClientValidationSchema = useMemo(
    () => {
      return (key: string, schema: VetoTypeAny | null) => {
        // if no schema and no client validation schemas, do nothing
        if (!clientValidationSchemas[key] && !schema) {
          return;
        }
        // update client validation schemas
        setClientValidationSchemas((prev) => {
          if (!schema) {
            const { [key]: _removed, ...rest } = prev;
            return rest;
          }
          return { ...prev, [key]: schema };
        });
      };
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

  // Create client schema hash for optimized memoization
  const clientValidationSchemasHash = JSON.stringify(
    Object.values(clientValidationSchemas).map(({ schema }) =>
      serializeSchema(schema),
    ),
  );

  // Create a stable dependency array from the client validation schemas
  const clientSchemaValues = useMemo(
    () => {
      const keys = Object.keys(clientValidationSchemas).sort();
      return keys.map((key) => clientValidationSchemas[key]).filter(Boolean);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientValidationSchemasHash],
  );

  // Memoized extended validation instance
  const extendedValidation = useMemo(
    () => {
      // If no base validation and no client schemas, return undefined
      if (!baseValidation && clientSchemaValues.length === 0) {
        return undefined;
      }

      // Start with base validation schema
      let combinedSchema = baseValidation;

      // Combine client validation schemas if any exist
      if (clientSchemaValues.length > 0) {
        const clientSchemasCombined = clientSchemaValues.reduce(
          (combined, clientSchema) => {
            return combined
              ? veto(and(combined.schema, clientSchema.schema))
              : veto(clientSchema.schema);
          },
          null as VetoInstance | null,
        );

        if (clientSchemasCombined) {
          if (combinedSchema) {
            // Combine base schema with client schemas
            combinedSchema = veto(
              and(combinedSchema.schema, clientSchemasCombined.schema),
            );
          } else {
            // Only client schemas, no base schema
            combinedSchema = clientSchemasCombined;
          }
        }
      }

      return combinedSchema;
    },
    // Using hash-based dependency to optimize performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientValidationSchemasHash],
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
      const result = await extendedValidation.validateAsync(values);
      validationErrors.current = result.errors;
      return result;
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
