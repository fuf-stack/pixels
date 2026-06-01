import type {
  VetoFormattedError,
  VetoInstance,
  VetoTypeAny,
} from '@fuf-stack/veto';
import type { FieldValues } from 'react-hook-form';

import { useCallback, useMemo, useRef, useState } from 'react';

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
 * Hook that creates a React Hook Form resolver from an extended validation instance.
 *
 * @param extendedValidation - Extended validation instance from useExtendedValidation
 * @returns Object containing resolver function, current validation errors, and optimization hash
 */
export const useFormResolver = (
  extendedValidation?: VetoInstance,
  onValidationErrorsChange?: (validationErrorsHash: string | undefined) => void,
) => {
  // Keep validation errors in a ref to avoid re-renders on each resolver run.
  // This preserves UX/snapshot behavior where validation updates alone
  // do not force immediate visual error state changes.
  const validationErrors = useRef<VetoFormattedError>(undefined);
  const validationErrorsHash = useRef<string | undefined>(undefined);

  const updateValidationErrors = useCallback(
    (errors: VetoFormattedError | undefined): void => {
      // Store the formatted errors in a ref so resolver runs stay cheap and do
      // not automatically repaint every form consumer.
      validationErrors.current = errors;

      // The hash is the reactive signal for consumers. Only notify when the
      // actual error output changes, so repeated validations with the same
      // result do not cause avoidable context refreshes.
      const nextHash = JSON.stringify(errors);

      if (validationErrorsHash.current !== nextHash) {
        validationErrorsHash.current = nextHash;
        onValidationErrorsChange?.(nextHash);
      }
    },
    [onValidationErrorsChange],
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

  /* eslint-disable react-hooks/refs -- intentional non-reactive cache reads */
  const currentValidationErrors = validationErrors.current;
  const currentValidationErrorsHash = validationErrorsHash.current;

  return {
    resolver,
    validationErrors: currentValidationErrors,
    validationErrorsHash: currentValidationErrorsHash,
  };
  /* eslint-enable react-hooks/refs */
};
