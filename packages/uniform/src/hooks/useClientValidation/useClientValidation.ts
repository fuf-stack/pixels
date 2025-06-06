/* eslint-disable import/prefer-default-export */

import type { VetoTypeAny } from '@fuf-stack/veto';

import { useContext, useEffect, useId } from 'react';

import { UniformContext } from '../../Form/subcomponents/FormContext';

/**
 * Hook for adding dynamic client-side validation to forms.
 *
 * Automatically manages validation schema lifecycle: sets schema when data is provided,
 * clears schema when data is null/undefined, and cleans up on unmount.
 *
 * @param data - Data to create validation schema from (or null/undefined to clear validation)
 * @param schemaFactory - Function that creates a validation schema from the data.
 */
export const useClientValidation = <TData = unknown>(
  data: TData | null | undefined,
  schemaFactory: (data: TData) => VetoTypeAny,
): void => {
  const {
    validation: { setClientValidationSchema },
  } = useContext(UniformContext);
  const key = useId(); // Auto-generate unique key

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

    // Cleanup on unmount or when dependencies change
    return () => setClientValidationSchema(key, null);
    // Only re-run when data (dataHash) or key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataHash, key]);
};
