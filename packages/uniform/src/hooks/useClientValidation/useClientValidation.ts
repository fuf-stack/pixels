/* eslint-disable import/prefer-default-export */

import type { VetoTypeAny } from '@fuf-stack/veto';

import { useEffect, useId } from 'react';

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
