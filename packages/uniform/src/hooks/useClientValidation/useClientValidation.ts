import type { VetoTypeAny } from '@fuf-stack/veto';

import { useEffect, useId } from 'react';

import { array, objectLoose } from '@fuf-stack/veto';

import { useFormContext } from '../useFormContext/useFormContext';

/**
 * Hook for adding dynamic client-side validation to forms.
 *
 * Automatically manages validation schema lifecycle: sets schema when data is provided,
 * clears schema when data is null/undefined, and cleans up on unmount.
 *
 * When the client validation schema changes, automatically re-validates all touched
 * fields to ensure they are validated against the new schema.
 *
 * @param data - Data to create validation schema from (or null/undefined to clear validation)
 * @param schemaFactory - Function that creates a validation schema from the data.
 *
 * @example
 * ```tsx
 * const { data: teamData } = useTeamQuery(teamId);
 *
 * useClientValidation(teamData, (data) =>
 *   vt.object({
 *     username: vt.string().refine(
 *       (value) => !data.existingUsers.includes(value),
 *       { message: 'Username already exists' }
 *     )
 *   })
 * );
 * ```
 */
export const useClientValidation = <TData = unknown>(
  data: TData | null | undefined,
  schemaFactory: (data: TData) => VetoTypeAny,
): void => {
  const {
    formState: { touchedFields },
    validation: { setClientValidationSchema },
    trigger,
  } = useFormContext();

  // Auto-generate unique key
  const key = useId();

  // Use data hash instead of object reference to avoid unnecessary re-runs
  // when data object reference changes but data remains the same
  const dataHash = JSON.stringify(data);

  // Single effect to manage validation schema lifecycle
  useEffect(() => {
    // Set validation schema when data is available
    if (data != null) {
      const validationSchema = schemaFactory(data);
      setClientValidationSchema(key, validationSchema);
    } else {
      // Clear validation schema when no data
      setClientValidationSchema(key, null);
    }

    // Re-validate all touched fields when client validation schema changes
    const touchedFieldNames = Object.keys(touchedFields);
    if (touchedFieldNames.length > 0) {
      // Use setTimeout to ensure the client validation schema update has propagated
      // before triggering re-validation (fixes race condition)
      setTimeout(async () => {
        return trigger(touchedFieldNames);
      }, 1);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      setClientValidationSchema(key, null);
    };
    // Only re-run when data (dataHash) or key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataHash, key]);
};

/**
 * Helper function to create a veto looseObject schema for a single field with nested path support.
 *
 * Parses field paths (dot-notation) and creates properly nested loose object schemas with array support.
 * All intermediate objects and arrays are marked as optional to allow partial data structures.
 * Numeric segments in the path are treated as array indices, and the parent field is wrapped in an array schema.
 *
 * @param name - The dot-separated path to the field (e.g., 'username', 'user.profile.email', 'items.0.name')
 * @param fieldSchema - The veto validation schema for the field
 * @returns A nested loose object schema matching the field path structure with proper type inference
 *
 * @example
 * ```tsx
 * // Simple field
 * clientValidationSchemaByName('username', vt.string())
 * // => objectLoose({ username: vt.string() })
 * ```
 *
 * @example
 * ```tsx
 * // Nested field (with optional intermediate objects)
 * clientValidationSchemaByName('user.profile.email', vt.string().email())
 * // => objectLoose({ user: objectLoose({ profile: objectLoose({ email: vt.string().email() }).optional() }).optional() })
 * ```
 *
 * @example
 * ```tsx
 * // Array field (with optional array)
 * clientValidationSchemaByName('items.0.name', vt.string())
 * // => objectLoose({ items: array(objectLoose({ name: vt.string() })).optional() })
 * ```
 *
 * @example
 * ```tsx
 * // Usage with useClientValidation
 * const { data: userData } = useUserQuery(userId);
 *
 * useClientValidation(userData, (data) =>
 *   clientValidationSchemaByName('username', vt.string().refine(
 *     (value) => !data.existingUsernames.includes(value),
 *     { message: 'Username already taken' }
 *   ))
 * );
 * ```
 */
export const clientValidationSchemaByName = <T extends VetoTypeAny>(
  name: string,
  fieldSchema: T,
) => {
  const segments = name.split('.');

  // Build schema from innermost to outermost
  let schema: VetoTypeAny = fieldSchema;

  // Process segments in reverse order to build nested structure
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const segment = segments[i];
    const isNumeric = /^\d+$/.test(segment);

    if (isNumeric) {
      // Current segment is an array index - wrap current schema in optional array
      schema = array(schema).optional();
    } else {
      // Current segment is a field name - wrap in objectLoose
      // Make it optional if it's an intermediate object (not the root)
      const obj = objectLoose({
        [segment]: schema,
      });
      schema = i > 0 ? obj.optional() : obj;
    }
  }

  return schema;
};
