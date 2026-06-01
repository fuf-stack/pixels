import type {
  VetoFormattedError,
  VetoInstance,
  VetoTypeAny,
} from '@fuf-stack/veto';
import type { FieldValues } from 'react-hook-form';

import { useCallback, useMemo, useState } from 'react';

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
  const clientSchemaValues = useMemo<VetoTypeAny[]>(
    () => {
      const keys = Object.keys(clientValidationSchemas).sort();
      return keys
        .map((key) => {
          return clientValidationSchemas[key];
        })
        .filter((schema): schema is VetoTypeAny => {
          return Boolean(schema);
        });
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
      const clientSchemasCombined =
        clientSchemaValues.reduce<VetoTypeAny | null>(
          (combined, clientSchema) => {
            return combined ? and(combined, clientSchema) : clientSchema;
          },
          null,
        );

      // return combined validation
      if (baseValidation && clientSchemasCombined) {
        // Put client validation first so dynamic/domain-specific messages
        // are returned before generic base validation errors.
        const baseSchema = baseValidation.schema as VetoTypeAny;
        return veto(and(clientSchemasCombined, baseSchema));
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
 * Render state for formatted validation errors produced by the resolver.
 *
 * `errors` is the value exposed through Uniform context. `hash` is the stable
 * comparison key used to avoid re-rendering context consumers when validation
 * returns an equivalent error object with a new identity.
 */
interface ValidationErrorsState {
  /** Formatted validation errors exposed to Uniform consumers. */
  errors: VetoFormattedError | undefined;
  /** JSON hash of `errors`, used as a cheap equality signal. */
  hash: string | undefined;
}

/**
 * Creates a React Hook Form resolver from an extended validation instance and
 * stores its latest formatted Veto errors as React state.
 *
 * Keeping the resolver errors in state lets Uniform context consumers re-render
 * when validation output changes, while the hash prevents repeated validations
 * with equivalent errors from causing unnecessary updates.
 *
 * @param extendedValidation - Extended validation instance from useExtendedValidation
 * @returns Resolver function plus the latest validation errors and their hash
 */
export const useFormResolver = (extendedValidation?: VetoInstance) => {
  // Keep the latest resolver errors in React state so Uniform context consumers
  // re-render when validation output changes. The paired hash lets us skip the
  // state update when a resolver run returns equivalent errors.
  const [validationErrorsState, setValidationErrorsState] =
    useState<ValidationErrorsState>({
      errors: undefined,
      hash: undefined,
    });

  /**
   * Updates resolver error state only when the formatted validation result
   * actually changes. Veto/RHF may create new error objects for equivalent
   * validation output, so the hash is the guard against avoidable context
   * refreshes.
   */
  const updateValidationErrors = useCallback(
    (errors: VetoFormattedError | undefined): void => {
      const nextHash = JSON.stringify(errors);

      setValidationErrorsState((current) => {
        if (current.hash === nextHash) {
          return current;
        }

        return {
          errors,
          hash: nextHash,
        };
      });
    },
    [],
  );

  // Memoized resolver function for React Hook Form
  const resolver = useMemo(() => {
    if (!extendedValidation) {
      return undefined;
    }

    return async (values: FieldValues) => {
      const validationValues = toValidationFormat(values) ?? {};
      const result = await extendedValidation.validateAsync(validationValues);
      updateValidationErrors(result.errors ?? undefined);

      // Transform veto result to React Hook Form format
      return {
        values: result.data ?? {},
        errors: result.errors ?? {},
      };
    };
  }, [extendedValidation, updateValidationErrors]);

  return {
    resolver,
    validationErrors: validationErrorsState.errors,
    validationErrorsHash: validationErrorsState.hash,
  };
};
