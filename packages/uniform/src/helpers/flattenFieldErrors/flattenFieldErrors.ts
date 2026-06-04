/* eslint-disable import-x/prefer-default-export */

import type { FieldError } from 'react-hook-form';

/**
 * Narrow an unknown value to a react-hook-form `FieldError`.
 *
 * RHF `FieldError` entries carry metadata like `message` and/or `type`,
 * while container nodes (objects keyed by index, `_errors`, etc.) do not.
 * This guard distinguishes leaf errors from nested wrappers.
 */
const isFieldError = (error: unknown): error is FieldError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'type' in error)
  );
};

/**
 * Normalize RHF validation payloads to a flat `FieldError[]`.
 *
 * Depending on field shape, RHF may return:
 * - a single `FieldError`
 * - an array of `FieldError`
 * - nested objects keyed by array indices
 * - objects containing `_errors` arrays for array/object-level issues
 */
export const flattenFieldErrors = (error: unknown): FieldError[] => {
  if (!error) {
    return [];
  }

  if (Array.isArray(error)) {
    return error.flatMap((item) => {
      return flattenFieldErrors(item);
    });
  }

  if (isFieldError(error)) {
    return [error];
  }

  if (typeof error === 'object') {
    return Object.values(error as Record<string, unknown>).flatMap((item) => {
      return flattenFieldErrors(item);
    });
  }

  return [];
};
